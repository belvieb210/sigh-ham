import "server-only";
import type { TypeEstimationHonoraires } from "@/generated/prisma/client";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { uploaderFichier } from "@/lib/stockage/fichiers";
import {
  genererPdfEstimationConvention,
  type DonneesEstimationConventionPdf,
} from "@/lib/eglise/generer-estimation-convention-pdf";
import { reorienterPatientDepuisEglise } from "@/lib/eglise/reorienter-patient";
import { construireLignesEstimationExamens } from "@/lib/caisse/construire-lignes-estimation-examens";

const HONORAIRE_PCT_DEFAUT = 5;

function decimalVersNombre(v: { toNumber?: () => number } | number | string): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

export function calculerMontantsEstimation(
  sousTotalUsd: number,
  remiseUsd: number,
  honorairePct = HONORAIRE_PCT_DEFAUT
) {
  const remise = Math.max(0, remiseUsd);
  const totalPatientUsd = Math.max(0, sousTotalUsd - remise);
  const honoraireUsd =
    Math.round(totalPatientUsd * (honorairePct / 100) * 100) / 100;
  return { totalPatientUsd, honoraireUsd, honorairePct };
}

export interface LigneEstimationInput {
  typeExamenId?: string;
  code: string;
  libelle: string;
  prixUnitaire: number;
}

type EstimationAvecRelations = NonNullable<
  Awaited<ReturnType<typeof prisma.estimationConvention.findFirst>>
> & {
  lignes: { code: string; libelle: string; prixUnitaire: unknown }[];
  dossier: {
    numeroDossier: string;
    patient: { numeroPatient: string; prenom: string; nom: string };
  };
  emetteur: { prenom: string; nom: string };
  medecinExterne?: { prenom: string; nom: string } | null;
  traitePar?: { prenom: string; nom: string } | null;
};

export type EstimationMapperSource = EstimationAvecRelations;

export function mapperEstimation(e: EstimationMapperSource) {
  const typeEstimation = e.typeEstimation as TypeEstimationHonoraires;
  const libelleSource =
    typeEstimation === "MEDECIN_EXTERNE"
      ? e.medecinExterne
        ? `${e.medecinExterne.prenom} ${e.medecinExterne.nom}`.trim()
        : e.nomConvention
      : e.nomConvention;

  return {
    id: e.id,
    dossierId: e.dossierId,
    transfertId: e.transfertId,
    typeEstimation,
    numeroDossier: e.dossier.numeroDossier,
    numeroPatient: e.dossier.patient.numeroPatient,
    nomComplet: `${e.dossier.patient.prenom} ${e.dossier.patient.nom}`.trim(),
    nomConvention: e.nomConvention,
    libelleSource: libelleSource ?? null,
    medecinResponsable: e.medecinResponsable,
    sousTotalUsd: decimalVersNombre(e.sousTotalUsd),
    remiseUsd: decimalVersNombre(e.remiseUsd),
    honorairePct: decimalVersNombre(e.honorairePct),
    honoraireUsd: decimalVersNombre(e.honoraireUsd),
    totalPatientUsd: decimalVersNombre(e.totalPatientUsd),
    pdfUrl: e.pdfUrl,
    statut: e.statut,
    emisLe: e.emisLe.toISOString(),
    envoyeCaisseLe: e.envoyeCaisseLe?.toISOString() ?? null,
    traiteLe: e.traiteLe?.toISOString() ?? null,
    traiteParNom: e.traitePar
      ? `${e.traitePar.prenom} ${e.traitePar.nom}`.trim()
      : null,
    emetteurNom: `${e.emetteur.prenom} ${e.emetteur.nom}`.trim(),
    lignes: e.lignes.map((l) => ({
      code: l.code,
      libelle: l.libelle,
      prixUnitaire: decimalVersNombre(l.prixUnitaire as Parameters<typeof decimalVersNombre>[0]),
    })),
  };
}

export async function creerEstimationConvention(params: {
  agentId: string;
  dossierId: string;
  transfertId?: string | null;
  nomConvention?: string | null;
  medecinResponsable: string;
  remiseUsd?: number;
  lignes: LigneEstimationInput[];
  pdfBuffer?: Buffer | null;
}) {
  if (params.lignes.length === 0) {
    throw new Error("Au moins un examen est requis pour l'estimation.");
  }

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
    remiseUsd
  );

  const patientNom = [dossier.patient.prenom, dossier.patient.nom]
    .filter(Boolean)
    .join(" ");

  const donneesPdf: DonneesEstimationConventionPdf = {
    hopital: INFORMATIONS_HOPITAL.nomComplet ?? INFORMATIONS_HOPITAL.nomCourt,
    service: "Service Conventionné",
    numeroDossier: dossier.numeroDossier,
    patient: patientNom,
    telephone: dossier.patient.telephone,
    nomConvention: params.nomConvention,
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
    `estimation-${dossier.numeroDossier}-${Date.now()}.pdf`,
    "application/pdf",
    { sousDossier: "estimations-convention" }
  );

  const estimation = await prisma.estimationConvention.create({
    data: {
      dossierId: params.dossierId,
      transfertId: params.transfertId ?? null,
      emetteurId: params.agentId,
      typeEstimation: "CONVENTION_EGLISE",
      nomConvention: params.nomConvention?.trim() || null,
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

  const { enregistrerAudit } = await import("@/lib/admin/audit");
  await enregistrerAudit({
    utilisateurId: params.agentId,
    type: "CREATION",
    module: "EGLISE",
    entite: "Estimation",
    entiteId: estimation.id,
    action: `Estimation convention pour ${patientNom}`,
  });

  return mapperEstimation(estimation as EstimationMapperSource);
}

export async function listerEstimationsConvention(options?: {
  emetteurId?: string;
  jour?: Date;
}) {
  const debut = options?.jour ? new Date(options.jour) : new Date();
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setHours(23, 59, 59, 999);

  const estimations = await prisma.estimationConvention.findMany({
    where: {
      typeEstimation: "CONVENTION_EGLISE",
      ...(options?.emetteurId ? { emetteurId: options.emetteurId } : {}),
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

export async function obtenirEstimationActiveParDossier(dossierId: string) {
  const e = await prisma.estimationConvention.findFirst({
    where: {
      dossierId,
      typeEstimation: "CONVENTION_EGLISE",
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

export async function listerEstimationsPourCaisse() {
  const estimations = await prisma.estimationConvention.findMany({
    where: { statut: { in: ["ENVOYEE_CAISSE", "TRAITE"] } },
    include: {
      lignes: true,
      dossier: { include: { patient: true } },
      emetteur: { select: { prenom: true, nom: true, telephone: true } },
      medecinExterne: { select: { prenom: true, nom: true } },
      traitePar: { select: { prenom: true, nom: true } },
    },
    orderBy: { envoyeCaisseLe: "desc" },
  });

  return estimations.map((e) => mapperEstimation(e as EstimationMapperSource));
}

export async function obtenirEstimationConvention(id: string) {
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
  if (!e) throw new Error("Estimation introuvable.");
  return mapperEstimation(e as EstimationMapperSource);
}

export async function envoyerEstimationVersCaisse(agentId: string, estimationId: string) {
  const estimation = await prisma.estimationConvention.findUnique({
    where: { id: estimationId },
    include: { dossier: true },
  });
  if (!estimation) throw new Error("Estimation introuvable.");
  if (estimation.statut === "TRAITE") {
    throw new Error("Cette estimation est déjà traitée.");
  }

  let transfertId = estimation.transfertId;

  if (!transfertId) {
    const resultat = await reorienterPatientDepuisEglise(
      agentId,
      estimation.dossierId,
      ["CAISSE"]
    );
    transfertId = resultat.transfertIds[0] ?? resultat.destinationsCreees[0]?.transfertId ?? null;
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

export async function approuverEstimationHonoraires(
  utilisateurCaisseId: string,
  estimationId: string
) {
  const estimation = await prisma.estimationConvention.findUnique({
    where: { id: estimationId },
  });
  if (!estimation) throw new Error("Estimation introuvable.");
  if (estimation.statut !== "ENVOYEE_CAISSE") {
    throw new Error("Seules les estimations envoyées à la caisse peuvent être approuvées.");
  }

  const miseAJour = await prisma.estimationConvention.update({
    where: { id: estimationId },
    data: {
      statut: "TRAITE",
      traiteLe: new Date(),
      traiteParId: utilisateurCaisseId,
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

export async function creerEstimationDepuisDossier(
  agentId: string,
  dossierId: string,
  options?: {
    transfertId?: string;
    nomConvention?: string;
    remiseUsd?: number;
  }
) {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        include: { typeExamen: true, paquetBilan: true },
      },
      enregistrementsReception: {
        orderBy: { enregistreLe: "desc" },
        take: 1,
      },
      examensPrenuptiaux: { orderBy: { planifieLe: "desc" }, take: 1 },
    },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const lignes = construireLignesEstimationExamens(dossier.examensLaboratoire);

  if (lignes.length === 0) {
    throw new Error("Aucun examen prescrit pour ce dossier.");
  }

  const enreg = dossier.enregistrementsReception[0];
  return creerEstimationConvention({
    agentId,
    dossierId,
    transfertId: options?.transfertId,
    nomConvention:
      options?.nomConvention ?? dossier.examensPrenuptiaux[0]?.paroisse ?? null,
    medecinResponsable: enreg?.medecinResponsable?.trim() || "—",
    remiseUsd: options?.remiseUsd ?? decimalVersNombre(enreg?.remise ?? 0),
    lignes,
  });
}

export async function attacherPdfUploadEstimation(
  estimationId: string,
  buffer: Buffer,
  nomFichier: string
) {
  const upload = await uploaderFichier(buffer, nomFichier, "application/pdf", {
    sousDossier: "estimations-convention",
  });
  await prisma.estimationConvention.update({
    where: { id: estimationId },
    data: { pdfUrl: upload.url },
  });
  return upload.url;
}
