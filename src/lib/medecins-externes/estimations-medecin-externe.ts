import "server-only";
import type { TypeEstimationHonoraires } from "@/generated/prisma/client";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { uploaderFichier } from "@/lib/stockage/fichiers";
import {
  genererPdfEstimationConvention,
  type DonneesEstimationConventionPdf,
} from "@/lib/eglise/generer-estimation-convention-pdf";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";
import {
  calculerMontantsEstimation,
  type LigneEstimationInput,
  mapperEstimation,
  type EstimationMapperSource,
} from "@/lib/eglise/estimations-convention";

export const HONORAIRE_PCT_MEDECIN_EXTERNE = 20;
const TYPE_ESTIMATION: TypeEstimationHonoraires = "MEDECIN_EXTERNE";

function decimalVersNombre(v: { toNumber?: () => number } | number | string): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

export async function creerEstimationMedecinExterne(params: {
  agentId: string;
  medecinExterneId: string;
  dossierId: string;
  transfertId?: string | null;
  medecinResponsable: string;
  remiseUsd?: number;
  lignes: LigneEstimationInput[];
  pdfBuffer?: Buffer | null;
}) {
  if (params.lignes.length === 0) {
    throw new Error("Au moins un examen est requis pour l'estimation.");
  }

  const medecin = await prisma.medecinExterne.findUnique({
    where: { id: params.medecinExterneId },
  });
  if (!medecin) throw new Error("Médecin externe introuvable.");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: params.dossierId },
    include: { patient: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const agent = await prisma.utilisateur.findUnique({
    where: { id: params.agentId },
    select: { prenom: true, nom: true },
  });

  const sousTotalUsd = params.lignes.reduce((acc, l) => acc + l.prixUnitaire, 0);
  const remiseUsd = Math.max(0, params.remiseUsd ?? 0);
  const { totalPatientUsd, honoraireUsd, honorairePct } = calculerMontantsEstimation(
    sousTotalUsd,
    remiseUsd,
    HONORAIRE_PCT_MEDECIN_EXTERNE
  );

  const patientNom = [dossier.patient.prenom, dossier.patient.nom]
    .filter(Boolean)
    .join(" ");
  const nomMedecin = [medecin.prenom, medecin.nom].filter(Boolean).join(" ");

  const donneesPdf: DonneesEstimationConventionPdf = {
    hopital: INFORMATIONS_HOPITAL.nomComplet ?? INFORMATIONS_HOPITAL.nomCourt,
    service: "Médecins externes",
    numeroDossier: dossier.numeroDossier,
    patient: patientNom,
    telephone: dossier.patient.telephone,
    nomConvention: nomMedecin,
    medecinResponsable: params.medecinResponsable,
    agentNom: agent ? `${agent.prenom} ${agent.nom}`.trim() : "—",
    dateEmission: new Date().toLocaleString("fr-FR"),
    lignes: params.lignes.map((l) => ({
      code: l.code,
      libelle: l.libelle,
      prixUnitaire: l.prixUnitaire,
    })),
    sousTotalUsd,
    remiseUsd,
    totalPatientUsd,
    honorairePct,
    honoraireUsd,
  };

  const buffer =
    params.pdfBuffer ?? (await genererPdfEstimationConvention(donneesPdf));

  const upload = await uploaderFichier(
    buffer,
    `estimation-me-${dossier.numeroDossier}-${Date.now()}.pdf`,
    "application/pdf",
    { sousDossier: "estimations-medecins-externes" }
  );

  const estimation = await prisma.estimationConvention.create({
    data: {
      dossierId: params.dossierId,
      transfertId: params.transfertId ?? null,
      emetteurId: params.agentId,
      typeEstimation: TYPE_ESTIMATION,
      medecinExterneId: params.medecinExterneId,
      nomConvention: nomMedecin,
      medecinResponsable: params.medecinResponsable.trim(),
      sousTotalUsd,
      remiseUsd,
      honorairePct,
      honoraireUsd,
      totalPatientUsd,
      pdfUrl: upload.url,
      statut: "EMIS",
      lignes: {
        create: params.lignes.map((l) => ({
          typeExamenId: l.typeExamenId ?? null,
          code: l.code,
          libelle: l.libelle,
          prixUnitaire: l.prixUnitaire,
        })),
      },
    },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
  });

  return mapperEstimation(estimation as EstimationMapperSource);
}

export async function listerEstimationsMedecinExterne(options: {
  medecinExterneId: string;
  jour?: Date;
}) {
  const debut = options.jour ? new Date(options.jour) : new Date();
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setHours(23, 59, 59, 999);

  const estimations = await prisma.estimationConvention.findMany({
    where: {
      typeEstimation: TYPE_ESTIMATION,
      medecinExterneId: options.medecinExterneId,
      emisLe: { gte: debut, lte: fin },
      statut: { not: "ANNULE" },
    },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
    orderBy: { emisLe: "desc" },
  });

  const items = estimations.map((e) => mapperEstimation(e as EstimationMapperSource));
  const totaux = items.reduce(
    (acc, e) => ({
      totalPatients: acc.totalPatients + e.totalPatientUsd,
      honoraires: acc.honoraires + e.honoraireUsd,
      count: acc.count + 1,
    }),
    { totalPatients: 0, honoraires: 0, count: 0 }
  );

  return { estimations: items, totauxJour: totaux };
}

export async function obtenirEstimationActiveMedecinExterneParDossier(
  dossierId: string,
  medecinExterneId: string
) {
  const e = await prisma.estimationConvention.findFirst({
    where: {
      dossierId,
      typeEstimation: TYPE_ESTIMATION,
      medecinExterneId,
      statut: { not: "ANNULE" },
    },
    orderBy: { emisLe: "desc" },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
  });
  if (!e) return null;
  return mapperEstimation(e as EstimationMapperSource);
}

export async function obtenirEstimationMedecinExterne(id: string) {
  const e = await prisma.estimationConvention.findUnique({
    where: { id },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true, telephone: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
  });
  if (!e || e.typeEstimation !== TYPE_ESTIMATION) {
    throw new Error("Estimation introuvable.");
  }
  return mapperEstimation(e as EstimationMapperSource);
}

export async function envoyerEstimationMedecinExterneVersCaisse(
  agentId: string,
  medecinExterneId: string,
  estimationId: string
) {
  const estimation = await prisma.estimationConvention.findUnique({
    where: { id: estimationId },
    include: { dossier: true },
  });
  if (!estimation || estimation.typeEstimation !== TYPE_ESTIMATION) {
    throw new Error("Estimation introuvable.");
  }
  if (estimation.medecinExterneId !== medecinExterneId) {
    throw new Error("Estimation non autorisée.");
  }
  if (estimation.statut === "TRAITE") {
    throw new Error("Cette estimation est déjà traitée.");
  }

  let transfertId = estimation.transfertId;

  if (!transfertId) {
    const resultat = await reorienterPatientDepuisMedecinsExternes(
      agentId,
      medecinExterneId,
      estimation.dossierId,
      ["CAISSE"]
    );
    transfertId =
      resultat.transfertIds[0] ?? resultat.transfertId ?? null;
  }

  const miseAJour = await prisma.estimationConvention.update({
    where: { id: estimationId },
    data: {
      statut: "ENVOYEE_CAISSE",
      envoyeCaisseLe: new Date(),
      transfertId: transfertId ?? undefined,
    },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
  });

  return mapperEstimation(miseAJour as EstimationMapperSource);
}

export async function creerEstimationMedecinExterneDepuisDossier(
  agentId: string,
  medecinExterneId: string,
  dossierId: string,
  options?: {
    transfertId?: string;
    remiseUsd?: number;
  }
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        include: { typeExamen: true },
      },
      enregistrementsReception: {
        orderBy: { enregistreLe: "desc" },
        take: 1,
      },
    },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const lignes: LigneEstimationInput[] = dossier.examensLaboratoire.map((ex) => ({
    typeExamenId: ex.typeExamenId,
    code: ex.typeExamen.code,
    libelle: ex.typeExamen.libelle,
    prixUnitaire: decimalVersNombre(ex.typeExamen.prix),
  }));

  if (lignes.length === 0) {
    throw new Error("Aucun examen prescrit pour ce dossier.");
  }

  const enreg = dossier.enregistrementsReception[0];
  return creerEstimationMedecinExterne({
    agentId,
    medecinExterneId,
    dossierId,
    transfertId: options?.transfertId,
    medecinResponsable: enreg?.medecinResponsable?.trim() || "—",
    remiseUsd: options?.remiseUsd ?? decimalVersNombre(enreg?.remise ?? 0),
    lignes,
  });
}

export async function attacherPdfUploadEstimationMedecinExterne(
  estimationId: string,
  medecinExterneId: string,
  buffer: Buffer,
  nomFichier: string
) {
  const estimation = await prisma.estimationConvention.findUnique({
    where: { id: estimationId },
    select: { typeEstimation: true, medecinExterneId: true },
  });
  if (
    !estimation ||
    estimation.typeEstimation !== TYPE_ESTIMATION ||
    estimation.medecinExterneId !== medecinExterneId
  ) {
    throw new Error("Estimation introuvable.");
  }

  const upload = await uploaderFichier(buffer, nomFichier, "application/pdf", {
    sousDossier: "estimations-medecins-externes",
  });
  await prisma.estimationConvention.update({
    where: { id: estimationId },
    data: { pdfUrl: upload.url },
  });
  return upload.url;
}
