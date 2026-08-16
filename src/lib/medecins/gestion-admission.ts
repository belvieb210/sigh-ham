import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  AdmissionMedecins,
  LitDisponibleMedecins,
} from "@/lib/medecins/types";

async function assurerChambresLitsDev() {
  const count = await prisma.chambre.count();
  if (count > 0) return;

  await prisma.$transaction(async (tx) => {
    for (const numero of ["101", "102"]) {
      const chambre = await tx.chambre.create({
        data: {
          numero,
          service: "Médecine générale",
          capacite: 2,
          actif: true,
        },
      });
      await tx.lit.createMany({
        data: [
          { chambreId: chambre.id, numero: "A", occupe: false },
          { chambreId: chambre.id, numero: "B", occupe: false },
        ],
      });
    }
  });
}

export async function listerChambresLits(): Promise<LitDisponibleMedecins[]> {
  await assurerChambresLitsDev();

  const lits = await prisma.lit.findMany({
    where: { chambre: { actif: true } },
    include: {
      chambre: { select: { id: true, numero: true, service: true } },
    },
    orderBy: [{ chambre: { numero: "asc" } }, { numero: "asc" }],
  });

  return lits.map((l) => ({
    id: l.id,
    numero: l.numero,
    occupe: l.occupe,
    chambre: {
      id: l.chambre.id,
      numero: l.chambre.numero,
      service: l.chambre.service,
    },
  }));
}

function mapperAdmission(a: {
  id: string;
  dossierId: string;
  statut: string;
  motif: string;
  admisLe: Date;
  sortiLe: Date | null;
  notes: string | null;
  dossier: {
    numeroDossier: string;
    patient: { prenom: string; nom: string };
  };
  chambre: { id: string; numero: string; service: string } | null;
  lit: { id: string; numero: string } | null;
}): AdmissionMedecins {
  return {
    id: a.id,
    dossierId: a.dossierId,
    statut: a.statut,
    motif: a.motif,
    admisLe: a.admisLe.toISOString(),
    sortiLe: a.sortiLe?.toISOString() ?? null,
    notes: a.notes,
    patient: `${a.dossier.patient.prenom} ${a.dossier.patient.nom}`.trim(),
    numeroDossier: a.dossier.numeroDossier,
    chambre: a.chambre,
    lit: a.lit,
  };
}

const includeAdmission = {
  dossier: {
    select: {
      numeroDossier: true,
      patient: { select: { prenom: true, nom: true } },
    },
  },
  chambre: { select: { id: true, numero: true, service: true } },
  lit: { select: { id: true, numero: true } },
};

export async function listerAdmissionsMedecins(opts?: {
  activesSeulement?: boolean;
}): Promise<AdmissionMedecins[]> {
  const rows = await prisma.admission.findMany({
    where: opts?.activesSeulement
      ? { sortiLe: null, statut: { in: ["ADMIS", "EN_SOINS"] } }
      : undefined,
    include: includeAdmission,
    orderBy: { admisLe: "desc" },
    take: 100,
  });
  return rows.map(mapperAdmission);
}

export async function creerAdmission(input: {
  dossierId: string;
  litId: string;
  motif: string;
  notes?: string | null;
}): Promise<AdmissionMedecins> {
  await assurerChambresLitsDev();

  const dossierId = input.dossierId.trim();
  const litId = input.litId.trim();
  const motif = input.motif.trim();
  if (!dossierId || !litId || !motif) throw new Error("CHAMPS_REQUIS");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");

  const active = await prisma.admission.findFirst({
    where: {
      dossierId,
      sortiLe: null,
      statut: { in: ["ADMIS", "EN_SOINS"] },
    },
    select: { id: true },
  });
  if (active) throw new Error("ADMISSION_ACTIVE");

  const lit = await prisma.lit.findUnique({
    where: { id: litId },
    include: { chambre: true },
  });
  if (!lit || !lit.chambre.actif) throw new Error("LIT_INTROUVABLE");
  if (lit.occupe) throw new Error("LIT_OCCUPE");

  const admission = await prisma.$transaction(async (tx) => {
    await tx.lit.update({
      where: { id: litId },
      data: { occupe: true },
    });

    return tx.admission.create({
      data: {
        dossierId,
        litId,
        chambreId: lit.chambreId,
        motif,
        notes: input.notes?.trim() || null,
        statut: "ADMIS",
      },
      include: includeAdmission,
    });
  });

  return mapperAdmission(admission);
}

export async function sortirAdmission(id: string): Promise<AdmissionMedecins> {
  const existante = await prisma.admission.findUnique({
    where: { id },
    select: { id: true, litId: true, sortiLe: true, dossierId: true },
  });
  if (!existante) throw new Error("ADMISSION_INTROUVABLE");
  if (existante.sortiLe) throw new Error("DEJA_SORTI");

  const admission = await prisma.$transaction(async (tx) => {
    if (existante.litId) {
      await tx.lit.update({
        where: { id: existante.litId },
        data: { occupe: false },
      });
    }

    return tx.admission.update({
      where: { id },
      data: {
        sortiLe: new Date(),
        statut: "SORTI",
      },
      include: includeAdmission,
    });
  });

  const { evaluerEtCloturerVisite } = await import(
    "@/lib/visites/evaluer-cloture-visite"
  );
  await evaluerEtCloturerVisite(existante.dossierId);

  return mapperAdmission(admission);
}
