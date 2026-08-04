import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrdonnanceInbox, VenteResume } from "@/lib/pharmacie/types";
import { stockDisponibleMedicament } from "@/lib/pharmacie/stock-fefo";

function decimal(n: { toNumber?: () => number } | number | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  if (typeof n.toNumber === "function") return n.toNumber();
  return Number(n);
}

export async function listerOrdonnancesInbox(): Promise<OrdonnanceInbox[]> {
  const rows = await prisma.ordonnance.findMany({
    where: { statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] } },
    include: {
      medecin: { select: { prenom: true, nom: true } },
      dossier: {
        include: {
          patient: { select: { prenom: true, nom: true, numeroPatient: true } },
        },
      },
      lignes: {
        include: { medicament: true },
      },
    },
    orderBy: { prescritLe: "desc" },
    take: 100,
  });

  const result: OrdonnanceInbox[] = [];
  for (const o of rows) {
    const lignes = [];
    for (const l of o.lignes) {
      const stock = await stockDisponibleMedicament(l.medicamentId);
      lignes.push({
        id: l.id,
        medicamentId: l.medicamentId,
        medicamentNom: l.medicament.nom,
        quantite: l.quantite,
        posologie: l.posologie,
        prixUnitaire: decimal(l.medicament.prixUnitaire),
        stockDisponible: stock,
      });
    }
    result.push({
      id: o.id,
      dossierId: o.dossierId,
      numeroDossier: o.dossier.numeroDossier,
      numeroPatient: o.dossier.patient.numeroPatient,
      nomComplet: `${o.dossier.patient.prenom} ${o.dossier.patient.nom}`.trim(),
      medecin: `${o.medecin.prenom} ${o.medecin.nom}`.trim(),
      prescritLe: o.prescritLe.toISOString(),
      statut: o.statut,
      notes: o.notes,
      lignes,
    });
  }
  return result;
}

export async function preparerVenteDepuisOrdonnance(
  pharmacienId: string,
  ordonnanceId: string
) {
  const ordonnance = await prisma.ordonnance.findUnique({
    where: { id: ordonnanceId },
    include: { lignes: { include: { medicament: true } } },
  });
  if (!ordonnance) throw new Error("Ordonnance introuvable.");
  if (
    ordonnance.statut !== "EN_ATTENTE" &&
    ordonnance.statut !== "PARTIELLEMENT_DELIVREE"
  ) {
    throw new Error("Cette ordonnance ne peut plus être préparée.");
  }

  const existante = await prisma.ventePharmacie.findFirst({
    where: {
      ordonnanceId,
      statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE"] },
    },
  });
  if (existante) return existante;

  let montant = 0;
  const lignesData = ordonnance.lignes.map((l) => {
    const prix = decimal(l.medicament.prixUnitaire);
    montant += prix * l.quantite;
    return {
      medicamentId: l.medicamentId,
      quantite: l.quantite,
      prixUnitaire: prix,
      remise: 0,
    };
  });

  const numero = `VTE-${Date.now().toString(36).toUpperCase()}`;
  return prisma.ventePharmacie.create({
    data: {
      numero,
      dossierId: ordonnance.dossierId,
      type: "ORDONNANCE",
      ordonnanceId,
      pharmacienId,
      montantTotal: montant,
      lignes: { create: lignesData },
    },
    include: { lignes: true },
  });
}

export async function mapperVenteResume(v: {
  id: string;
  numero: string;
  dossierId: string;
  type: string;
  statut: string;
  montantTotal: unknown;
  creeLe: Date;
  factureId: string | null;
  ordonnanceId: string | null;
  dossier: { patient: { prenom: string; nom: string } };
}): Promise<VenteResume> {
  return {
    id: v.id,
    numero: v.numero,
    dossierId: v.dossierId,
    nomComplet: `${v.dossier.patient.prenom} ${v.dossier.patient.nom}`.trim(),
    type: v.type,
    statut: v.statut,
    montantTotal: decimal(v.montantTotal as never),
    creeLe: v.creeLe.toISOString(),
    factureId: v.factureId,
    ordonnanceId: v.ordonnanceId,
  };
}

export async function listerVentes(statuts?: string[]) {
  const ventes = await prisma.ventePharmacie.findMany({
    where: statuts?.length ? { statut: { in: statuts as never } } : undefined,
    include: {
      dossier: { include: { patient: { select: { prenom: true, nom: true } } } },
    },
    orderBy: { creeLe: "desc" },
    take: 100,
  });
  return Promise.all(ventes.map(mapperVenteResume));
}
