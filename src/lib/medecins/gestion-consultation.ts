import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import type {
  ActeConsultationMedecins,
  ConstanteVitaleResume,
  ConsultationDetailMedecins,
  ConsultationHistoriqueMedecins,
  DiagnosticConsultationMedecins,
  FormulaireCliniqueMedecins,
} from "@/lib/medecins/types";
import { Prisma } from "@/generated/prisma/client";

function decimalOuNull(
  valeur: { toNumber?: () => number } | number | string | null | undefined
): number | null {
  if (valeur == null) return null;
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") {
    const n = Number.parseFloat(valeur);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof valeur.toNumber === "function") return valeur.toNumber();
  return null;
}

function parserFormulaire(
  raw: Prisma.JsonValue | null | undefined
): FormulaireCliniqueMedecins | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as FormulaireCliniqueMedecins;
}

function mapperDiagnostic(d: {
  id: string;
  codeCim: string | null;
  libelle: string;
  principal: boolean;
}): DiagnosticConsultationMedecins {
  return {
    id: d.id,
    codeCim: d.codeCim,
    libelle: d.libelle,
    principal: d.principal,
  };
}

function mapperActe(a: {
  id: string;
  typeActe: string;
  libelle: string;
  quantite: number;
  notes: string | null;
}): ActeConsultationMedecins {
  return {
    id: a.id,
    typeActe: a.typeActe,
    libelle: a.libelle,
    quantite: a.quantite,
    notes: a.notes,
  };
}

function mapperConsultation(c: {
  id: string;
  dossierId: string;
  medecinId: string;
  motif: string;
  anamnese: string | null;
  examenClinique: string | null;
  conclusion: string | null;
  formulaireClinique?: Prisma.JsonValue | null;
  debutLe: Date;
  finLe: Date | null;
  medecin: { prenom: string; nom: string };
  diagnostics: {
    id: string;
    codeCim: string | null;
    libelle: string;
    principal: boolean;
  }[];
  actes: {
    id: string;
    typeActe: string;
    libelle: string;
    quantite: number;
    notes: string | null;
  }[];
  dossier: {
    numeroDossier: string;
    patient: {
      prenom: string;
      nom: string;
      numeroPatient: string;
      telephone: string | null;
      sexe: string | null;
      dateNaissance: Date | null;
    };
  };
}): ConsultationDetailMedecins {
  const dateNaissance = c.dossier.patient.dateNaissance?.toISOString() ?? null;
  return {
    id: c.id,
    dossierId: c.dossierId,
    medecinId: c.medecinId,
    motif: c.motif,
    anamnese: c.anamnese,
    examenClinique: c.examenClinique,
    conclusion: c.conclusion,
    formulaireClinique: parserFormulaire(c.formulaireClinique),
    debutLe: c.debutLe.toISOString(),
    finLe: c.finLe?.toISOString() ?? null,
    medecin: `${c.medecin.prenom} ${c.medecin.nom}`.trim(),
    diagnostics: c.diagnostics.map(mapperDiagnostic),
    actes: c.actes.map(mapperActe),
    patient: {
      numeroDossier: c.dossier.numeroDossier,
      numeroPatient: c.dossier.patient.numeroPatient,
      prenom: c.dossier.patient.prenom,
      nom: c.dossier.patient.nom,
      nomComplet: `${c.dossier.patient.prenom} ${c.dossier.patient.nom}`.trim(),
      telephone: c.dossier.patient.telephone,
      sexe: c.dossier.patient.sexe,
      dateNaissance,
      age: calculerAge(dateNaissance),
    },
  };
}

const includeConsultation = {
  medecin: { select: { prenom: true, nom: true } },
  diagnostics: { orderBy: [{ principal: "desc" as const }, { libelle: "asc" as const }] },
  actes: { orderBy: { libelle: "asc" as const } },
  dossier: {
    select: {
      numeroDossier: true,
      patient: {
        select: {
          prenom: true,
          nom: true,
          numeroPatient: true,
          telephone: true,
          sexe: true,
          dateNaissance: true,
        },
      },
    },
  },
};

export async function obtenirConsultationMedecins(
  id: string
): Promise<ConsultationDetailMedecins | null> {
  const c = await prisma.consultation.findUnique({
    where: { id },
    include: includeConsultation,
  });
  return c ? mapperConsultation(c) : null;
}

export async function obtenirConsultationOuverteDossier(
  dossierId: string
): Promise<ConsultationDetailMedecins | null> {
  const c = await prisma.consultation.findFirst({
    where: { dossierId, finLe: null },
    include: includeConsultation,
    orderBy: { debutLe: "desc" },
  });
  return c ? mapperConsultation(c) : null;
}

export async function creerConsultation(
  medecinId: string,
  input: {
    dossierId: string;
    motif: string;
    anamnese?: string | null;
    examenClinique?: string | null;
    conclusion?: string | null;
    formulaireClinique?: FormulaireCliniqueMedecins | null;
  }
): Promise<ConsultationDetailMedecins> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: input.dossierId },
    select: { id: true },
  });
  if (!dossier) {
    throw new Error("DOSSIER_INTROUVABLE");
  }

  const ouverte = await prisma.consultation.findFirst({
    where: { dossierId: input.dossierId, finLe: null },
    select: { id: true },
  });
  if (ouverte) {
    throw new Error("CONSULTATION_OUVERTE");
  }

  const motif = input.motif.trim();
  if (!motif) {
    throw new Error("MOTIF_REQUIS");
  }

  const c = await prisma.consultation.create({
    data: {
      dossierId: input.dossierId,
      medecinId,
      motif,
      anamnese: input.anamnese?.trim() || null,
      examenClinique: input.examenClinique?.trim() || null,
      conclusion: input.conclusion?.trim() || null,
      formulaireClinique:
        (input.formulaireClinique as Prisma.InputJsonValue) ?? undefined,
    },
    include: includeConsultation,
  });

  return mapperConsultation(c);
}

export async function mettreAJourConsultation(
  id: string,
  input: {
    motif?: string;
    anamnese?: string | null;
    examenClinique?: string | null;
    conclusion?: string | null;
    formulaireClinique?: FormulaireCliniqueMedecins | null;
  },
  options?: { autoriserCloturee?: boolean }
): Promise<ConsultationDetailMedecins> {
  const existante = await prisma.consultation.findUnique({
    where: { id },
    select: { id: true, finLe: true },
  });
  if (!existante) throw new Error("CONSULTATION_INTROUVABLE");
  if (existante.finLe && !options?.autoriserCloturee) {
    throw new Error("CONSULTATION_CLOTUREE");
  }

  const data: {
    motif?: string;
    anamnese?: string | null;
    examenClinique?: string | null;
    conclusion?: string | null;
    formulaireClinique?: Prisma.InputJsonValue | typeof Prisma.DbNull;
  } = {};

  if (input.motif !== undefined) {
    const motif = input.motif.trim();
    if (!motif) throw new Error("MOTIF_REQUIS");
    data.motif = motif;
  }
  if (input.anamnese !== undefined) {
    data.anamnese = input.anamnese?.trim() || null;
  }
  if (input.examenClinique !== undefined) {
    data.examenClinique = input.examenClinique?.trim() || null;
  }
  if (input.conclusion !== undefined) {
    data.conclusion = input.conclusion?.trim() || null;
  }
  if (input.formulaireClinique !== undefined) {
    data.formulaireClinique = input.formulaireClinique
      ? (input.formulaireClinique as Prisma.InputJsonValue)
      : Prisma.DbNull;
  }

  const c = await prisma.consultation.update({
    where: { id },
    data,
    include: includeConsultation,
  });

  return mapperConsultation(c);
}

export async function cloturerConsultation(
  id: string
): Promise<ConsultationDetailMedecins> {
  const existante = await prisma.consultation.findUnique({
    where: { id },
    select: { id: true, finLe: true },
  });
  if (!existante) throw new Error("CONSULTATION_INTROUVABLE");
  if (existante.finLe) throw new Error("CONSULTATION_CLOTUREE");

  const c = await prisma.consultation.update({
    where: { id },
    data: { finLe: new Date() },
    include: includeConsultation,
  });

  return mapperConsultation(c);
}

export async function ajouterDiagnostic(
  consultationId: string,
  input: { libelle: string; codeCim?: string | null; principal?: boolean }
): Promise<DiagnosticConsultationMedecins> {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    select: { id: true, finLe: true },
  });
  if (!consultation) throw new Error("CONSULTATION_INTROUVABLE");
  if (consultation.finLe) throw new Error("CONSULTATION_CLOTUREE");

  const libelle = input.libelle.trim();
  if (!libelle) throw new Error("LIBELLE_REQUIS");

  if (input.principal) {
    await prisma.diagnostic.updateMany({
      where: { consultationId, principal: true },
      data: { principal: false },
    });
  }

  const d = await prisma.diagnostic.create({
    data: {
      consultationId,
      libelle,
      codeCim: input.codeCim?.trim() || null,
      principal: Boolean(input.principal),
    },
  });

  return mapperDiagnostic(d);
}

export async function supprimerDiagnostic(id: string): Promise<void> {
  const d = await prisma.diagnostic.findUnique({
    where: { id },
    include: { consultation: { select: { finLe: true } } },
  });
  if (!d) throw new Error("DIAGNOSTIC_INTROUVABLE");
  if (d.consultation.finLe) throw new Error("CONSULTATION_CLOTUREE");

  await prisma.diagnostic.delete({ where: { id } });
}

export async function ajouterActe(
  consultationId: string,
  input: {
    typeActe: string;
    libelle: string;
    quantite?: number;
    notes?: string | null;
  }
): Promise<ActeConsultationMedecins> {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    select: { id: true, finLe: true },
  });
  if (!consultation) throw new Error("CONSULTATION_INTROUVABLE");
  if (consultation.finLe) throw new Error("CONSULTATION_CLOTUREE");

  const typeActe = input.typeActe.trim();
  const libelle = input.libelle.trim();
  if (!typeActe || !libelle) throw new Error("ACTE_INVALIDE");

  const quantite = input.quantite ?? 1;
  if (!Number.isFinite(quantite) || quantite < 1) {
    throw new Error("QUANTITE_INVALIDE");
  }

  const a = await prisma.prescriptionActe.create({
    data: {
      consultationId,
      typeActe,
      libelle,
      quantite: Math.floor(quantite),
      notes: input.notes?.trim() || null,
    },
  });

  return mapperActe(a);
}

export async function supprimerActe(id: string): Promise<void> {
  const a = await prisma.prescriptionActe.findUnique({
    where: { id },
    include: { consultation: { select: { finLe: true } } },
  });
  if (!a) throw new Error("ACTE_INTROUVABLE");
  if (a.consultation.finLe) throw new Error("CONSULTATION_CLOTUREE");

  await prisma.prescriptionActe.delete({ where: { id } });
}

function debutJourLocal(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function debutSemaineLocal(d = new Date()) {
  const jour = d.getDay();
  const diff = jour === 0 ? 6 : jour - 1;
  const debut = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  debut.setDate(debut.getDate() - diff);
  return debut;
}

export async function listerConsultationsDossier(
  dossierId: string
): Promise<ConsultationDetailMedecins[]> {
  const rows = await prisma.consultation.findMany({
    where: { dossierId },
    include: includeConsultation,
    orderBy: { debutLe: "desc" },
    take: 30,
  });
  return rows.map(mapperConsultation);
}

export async function obtenirConstantesVitalesDossier(
  dossierId: string
): Promise<ConstanteVitaleResume | null> {
  const constantes = await prisma.constantesVitales.findFirst({
    where: { dossierId },
    orderBy: { mesureLe: "desc" },
  });
  if (!constantes) return null;
  return {
    id: constantes.id,
    temperature: decimalOuNull(constantes.temperature),
    tensionSystolique: constantes.tensionSystolique,
    tensionDiastolique: constantes.tensionDiastolique,
    frequenceCardiaque: constantes.frequenceCardiaque,
    frequenceRespiratoire: constantes.frequenceRespiratoire,
    poidsKg: decimalOuNull(constantes.poidsKg),
    tailleCm: decimalOuNull(constantes.tailleCm),
    saturationO2: constantes.saturationO2,
    glycemie: decimalOuNull(constantes.glycemie),
    observations: constantes.observations,
    mesureLe: constantes.mesureLe.toISOString(),
  };
}

export async function listerConsultationsHistorique(opts?: {
  periode?: "jour" | "semaine";
}): Promise<ConsultationHistoriqueMedecins[]> {
  const periode = opts?.periode ?? "jour";
  const depuis =
    periode === "semaine" ? debutSemaineLocal() : debutJourLocal();

  const rows = await prisma.consultation.findMany({
    where: {
      finLe: { not: null, gte: depuis },
    },
    include: {
      medecin: { select: { prenom: true, nom: true } },
      dossier: {
        select: {
          numeroDossier: true,
          patient: { select: { prenom: true, nom: true } },
        },
      },
      _count: { select: { diagnostics: true, actes: true } },
    },
    orderBy: { finLe: "desc" },
    take: 100,
  });

  return rows.map((c) => ({
    id: c.id,
    dossierId: c.dossierId,
    motif: c.motif,
    debutLe: c.debutLe.toISOString(),
    finLe: c.finLe!.toISOString(),
    medecin: `${c.medecin.prenom} ${c.medecin.nom}`.trim(),
    patient: `${c.dossier.patient.prenom} ${c.dossier.patient.nom}`.trim(),
    numeroDossier: c.dossier.numeroDossier,
    nbDiagnostics: c._count.diagnostics,
    nbActes: c._count.actes,
    conclusion: c.conclusion,
  }));
}
