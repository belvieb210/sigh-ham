import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  MedicamentMedecins,
  OrdonnanceMedecins,
} from "@/lib/medecins/types";

const MEDICAMENTS_DEFAUT = [
  { code: "PARA500", nom: "Paracétamol", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.5 },
  { code: "IBU400", nom: "Ibuprofène", forme: "Comprimé", dosage: "400 mg", prixUnitaire: 0.8 },
  { code: "AMOX500", nom: "Amoxicilline", forme: "Gélule", dosage: "500 mg", prixUnitaire: 1.2 },
  { code: "MET500", nom: "Métronidazole", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.9 },
  { code: "OMEP20", nom: "Oméprazole", forme: "Gélule", dosage: "20 mg", prixUnitaire: 1.0 },
  { code: "CETI10", nom: "Cétirizine", forme: "Comprimé", dosage: "10 mg", prixUnitaire: 0.6 },
  { code: "ORS", nom: "SRO (sels de réhydratation)", forme: "Sachet", dosage: "1 sachet", prixUnitaire: 0.4 },
  { code: "ALB400", nom: "Albendazole", forme: "Comprimé", dosage: "400 mg", prixUnitaire: 0.7 },
  { code: "CIPRO500", nom: "Ciprofloxacine", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 1.5 },
  { code: "VITC", nom: "Vitamine C", forme: "Comprimé", dosage: "500 mg", prixUnitaire: 0.3 },
] as const;

function mapperMedicament(m: {
  id: string;
  code: string;
  nom: string;
  forme: string | null;
  dosage: string | null;
  prixUnitaire: { toNumber(): number } | number;
}): MedicamentMedecins {
  const prixUnitaire =
    typeof m.prixUnitaire === "number" ? m.prixUnitaire : m.prixUnitaire.toNumber();
  return {
    id: m.id,
    code: m.code,
    nom: m.nom,
    forme: m.forme,
    dosage: m.dosage,
    prixUnitaire,
  };
}

export async function assurerCatalogueMedicaments(): Promise<void> {
  const count = await prisma.medicament.count();
  if (count > 0) return;

  await prisma.medicament.createMany({
    data: MEDICAMENTS_DEFAUT.map((m) => ({
      code: m.code,
      nom: m.nom,
      forme: m.forme,
      dosage: m.dosage,
      prixUnitaire: m.prixUnitaire,
      actif: true,
    })),
    skipDuplicates: true,
  });
}

export async function listerMedicamentsMedecins(): Promise<MedicamentMedecins[]> {
  await assurerCatalogueMedicaments();
  const rows = await prisma.medicament.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
  });
  return rows.map(mapperMedicament);
}

function mapperOrdonnance(o: {
  id: string;
  dossierId: string;
  statut: string;
  prescritLe: Date;
  notes: string | null;
  medecin: { prenom: string; nom: string };
  dossier: {
    numeroDossier: string;
    patient: { prenom: string; nom: string };
  };
  lignes: {
    id: string;
    medicamentId: string;
    quantite: number;
    posologie: string | null;
    dureeJours: number | null;
    medicament: {
      id: string;
      code: string;
      nom: string;
      forme: string | null;
      dosage: string | null;
      prixUnitaire: { toNumber(): number } | number;
    };
  }[];
}): OrdonnanceMedecins {
  return {
    id: o.id,
    dossierId: o.dossierId,
    statut: o.statut,
    prescritLe: o.prescritLe.toISOString(),
    notes: o.notes,
    medecin: `${o.medecin.prenom} ${o.medecin.nom}`.trim(),
    patient: `${o.dossier.patient.prenom} ${o.dossier.patient.nom}`.trim(),
    numeroDossier: o.dossier.numeroDossier,
    lignes: o.lignes.map((l) => ({
      id: l.id,
      medicamentId: l.medicamentId,
      medicament: mapperMedicament(l.medicament),
      quantite: l.quantite,
      posologie: l.posologie,
      dureeJours: l.dureeJours,
    })),
  };
}

const includeOrdonnance = {
  medecin: { select: { prenom: true, nom: true } },
  dossier: {
    select: {
      numeroDossier: true,
      patient: { select: { prenom: true, nom: true } },
    },
  },
  lignes: {
    include: { medicament: true },
    orderBy: { medicament: { nom: "asc" as const } },
  },
};

export async function listerOrdonnancesMedecins(opts?: {
  dossierId?: string;
}): Promise<OrdonnanceMedecins[]> {
  const rows = await prisma.ordonnance.findMany({
    where: opts?.dossierId ? { dossierId: opts.dossierId } : undefined,
    include: includeOrdonnance,
    orderBy: { prescritLe: "desc" },
    take: 50,
  });
  return rows.map(mapperOrdonnance);
}

export async function creerOrdonnance(
  medecinId: string,
  input: {
    dossierId: string;
    notes?: string | null;
    lignes: {
      medicamentId: string;
      quantite: number;
      posologie?: string | null;
      dureeJours?: number | null;
    }[];
  }
): Promise<OrdonnanceMedecins> {
  await assurerCatalogueMedicaments();

  const dossierId = input.dossierId.trim();
  if (!dossierId) throw new Error("DOSSIER_ID_REQUIS");
  if (!input.lignes?.length) throw new Error("LIGNES_REQUISES");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");

  for (const ligne of input.lignes) {
    if (!ligne.medicamentId?.trim()) throw new Error("MEDICAMENT_REQUIS");
    if (!Number.isFinite(ligne.quantite) || ligne.quantite < 1) {
      throw new Error("QUANTITE_INVALIDE");
    }
  }

  const medIds = input.lignes.map((l) => l.medicamentId);
  const meds = await prisma.medicament.findMany({
    where: { id: { in: medIds }, actif: true },
    select: { id: true },
  });
  if (meds.length !== new Set(medIds).size) {
    throw new Error("MEDICAMENT_INVALIDE");
  }

  const o = await prisma.ordonnance.create({
    data: {
      dossierId,
      medecinId,
      notes: input.notes?.trim() || null,
      statut: "EN_ATTENTE",
      lignes: {
        create: input.lignes.map((l) => ({
          medicamentId: l.medicamentId,
          quantite: Math.floor(l.quantite),
          posologie: l.posologie?.trim() || null,
          dureeJours: l.dureeJours ?? null,
        })),
      },
    },
    include: includeOrdonnance,
  });

  return mapperOrdonnance(o);
}
