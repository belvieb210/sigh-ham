import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { obtenirSectionPharmacieDossier } from "@/lib/caisse/facturation-pharmacie";
import { prisma } from "@/lib/prisma";

export interface DossierVentePharmacie {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  telephone: string | null;
  age: number | null;
  sexe: string | null;
  adresse: string | null;
  ordonnanceId: string | null;
  lignesOrdonnance: {
    id: string;
    medicamentId: string;
    libelle: string;
    quantite: number;
    prixUnitaire: number;
    montant: number;
    stockDisponible: number;
  }[];
}

function decimal(v: { toNumber?: () => number } | number | string) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

export async function obtenirDossierVentePharmacie(
  dossierId: string
): Promise<DossierVentePharmacie | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: { patient: true },
  });
  if (!dossier) return null;

  const section = await obtenirSectionPharmacieDossier(dossierId);
  const patient = dossier.patient;

  let lignesOrdonnance = section.lignes.map((l) => ({
    id: l.id,
    medicamentId: "",
    libelle: l.libelle,
    quantite: l.quantite,
    prixUnitaire: l.prixUnitaire,
    montant: l.montant,
    stockDisponible: 0,
  }));

  if (section.ordonnanceId) {
    const ord = await prisma.ordonnance.findUnique({
      where: { id: section.ordonnanceId },
      include: { lignes: { include: { medicament: true } } },
    });
    if (ord) {
      lignesOrdonnance = ord.lignes.map((l) => ({
        id: l.id,
        medicamentId: l.medicamentId,
        libelle: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
        quantite: l.quantite,
        prixUnitaire: decimal(l.medicament.prixUnitaire),
        montant: decimal(l.medicament.prixUnitaire) * l.quantite,
        stockDisponible: 0,
      }));
    }
  }

  return {
    dossierId: dossier.id,
    numeroDossier: dossier.numeroDossier,
    numeroPatient: patient.numeroPatient,
    prenom: patient.prenom,
    nom: patient.nom,
    nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
    telephone: patient.telephone,
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    sexe: patient.sexe,
    adresse: patient.adresse,
    ordonnanceId: section.ordonnanceId,
    lignesOrdonnance,
  };
}
