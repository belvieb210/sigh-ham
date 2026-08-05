import "server-only";
import { Prisma } from "@/generated/prisma/client";
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
    detailsPrescription?: Record<string, unknown> | null;
    lignes: {
      medicamentId: string;
      quantite: number;
      posologie?: string | null;
      dureeJours?: number | null;
    }[];
    /** Défaut true : propose un transfert vers la pharmacie si le patient est en file médecins */
    orienterVersPharmacie?: boolean;
  }
): Promise<{
  ordonnance: OrdonnanceMedecins;
  transfertPharmacie?: { ok: boolean; message?: string };
}> {
  await assurerCatalogueMedicaments();

  const dossierId = input.dossierId.trim();
  if (!dossierId) throw new Error("DOSSIER_ID_REQUIS");
  const lignes = (input.lignes ?? []).filter((l) => l.medicamentId?.trim());
  const aDetails = Boolean(
    input.detailsPrescription &&
      Object.keys(input.detailsPrescription).length > 0
  );
  if (!lignes.length && !aDetails) throw new Error("LIGNES_REQUISES");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true },
  });
  if (!dossier) throw new Error("DOSSIER_INTROUVABLE");

  for (const ligne of lignes) {
    if (!Number.isFinite(ligne.quantite) || ligne.quantite < 1) {
      throw new Error("QUANTITE_INVALIDE");
    }
  }

  if (lignes.length > 0) {
    const medIds = lignes.map((l) => l.medicamentId);
    const meds = await prisma.medicament.findMany({
      where: { id: { in: medIds }, actif: true },
      select: { id: true },
    });
    if (meds.length !== new Set(medIds).size) {
      throw new Error("MEDICAMENT_INVALIDE");
    }
  }

  const o = await prisma.ordonnance.create({
    data: {
      dossierId,
      medecinId,
      notes: input.notes?.trim() || null,
      detailsPrescription: input.detailsPrescription
        ? (input.detailsPrescription as Prisma.InputJsonValue)
        : undefined,
      statut: "EN_ATTENTE",
      lignes:
        lignes.length > 0
          ? {
              create: lignes.map((l) => ({
                medicamentId: l.medicamentId,
                quantite: Math.floor(l.quantite),
                posologie: l.posologie?.trim() || null,
                dureeJours: l.dureeJours ?? null,
              })),
            }
          : undefined,
    },
    include: includeOrdonnance,
  });

  let transfertPharmacie: { ok: boolean; message?: string } | undefined;
  if (input.orienterVersPharmacie !== false && lignes.length > 0) {
    try {
      const { reorienterPatientDepuisMedecins } = await import(
        "@/lib/medecins/reorienter-patient-medecins"
      );
      await reorienterPatientDepuisMedecins(medecinId, dossierId, ["PHARMACIE"]);
      transfertPharmacie = { ok: true };
    } catch (e) {
      transfertPharmacie = {
        ok: false,
        message: e instanceof Error ? e.message : "Orientation pharmacie impossible.",
      };
    }
  }

  return { ordonnance: mapperOrdonnance(o), transfertPharmacie };
}
