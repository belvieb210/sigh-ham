import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { obtenirSectionPharmacieDossier } from "@/lib/caisse/facturation-pharmacie";
import { numeroIdentitePersonne } from "@/lib/pharmacie/client-walk-in";
import { prisma } from "@/lib/prisma";
import type { StatutVentePharmacie } from "@/generated/prisma/client";

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
  venteId: string | null;
  venteStatut: StatutVentePharmacie | null;
  numeroFacture: string | null;
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

function mapperLignesVente(
  lignes: {
    id: string;
    medicamentId: string;
    quantite: number;
    prixUnitaire: { toNumber?: () => number } | number | string;
    remise: { toNumber?: () => number } | number | string;
    medicament: { nom: string; dosage: string | null };
  }[]
) {
  return lignes.map((l) => {
    const prix = decimal(l.prixUnitaire);
    const remise = decimal(l.remise);
    return {
      id: l.id,
      medicamentId: l.medicamentId,
      libelle: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
      quantite: l.quantite,
      prixUnitaire: prix,
      montant: Math.max(0, prix * l.quantite - remise),
      stockDisponible: 0,
    };
  });
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

  const venteActive = await prisma.ventePharmacie.findFirst({
    where: {
      dossierId,
      statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE"] },
      type: "DIRECTE",
    },
    include: {
      lignes: { include: { medicament: true }, orderBy: { medicament: { nom: "asc" } } },
      facture: { select: { numeroFacture: true } },
    },
    orderBy: { creeLe: "desc" },
  });

  let lignesOrdonnance: DossierVentePharmacie["lignesOrdonnance"] = [];
  let ordonnanceId = section.ordonnanceId;
  let venteId: string | null = venteActive?.id ?? null;
  let venteStatut: StatutVentePharmacie | null = venteActive?.statut ?? null;
  let numeroFacture = venteActive?.facture?.numeroFacture ?? null;

  if (venteActive?.lignes.length) {
    lignesOrdonnance = mapperLignesVente(venteActive.lignes);
  } else if (section.ordonnanceId) {
    const ord = await prisma.ordonnance.findUnique({
      where: { id: section.ordonnanceId },
      include: { lignes: { include: { medicament: true } } },
    });
    if (ord) {
      ordonnanceId = ord.id;
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
    numeroPatient: numeroIdentitePersonne(dossier.numeroDossier, patient.numeroPatient),
    prenom: patient.prenom,
    nom: patient.nom,
    nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
    telephone: patient.telephone,
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    sexe: patient.sexe,
    adresse: patient.adresse,
    ordonnanceId,
    venteId,
    venteStatut,
    numeroFacture,
    lignesOrdonnance,
  };
}
