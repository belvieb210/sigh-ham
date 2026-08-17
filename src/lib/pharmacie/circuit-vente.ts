import "server-only";
import { prisma } from "@/lib/prisma";

/** Vente déjà transmise à la caisse, payée ou délivrée — plus dans la file pharmacie. */
export const STATUTS_VENTE_HORS_FILE = ["TRANSMISE", "PAYEE", "DELIVREE"] as const;

export async function idsDossiersVentePharmacieAvancee(
  dossierIds?: string[]
): Promise<Set<string>> {
  const where =
    dossierIds && dossierIds.length > 0
      ? {
          statut: { in: [...STATUTS_VENTE_HORS_FILE] },
          dossierId: { in: dossierIds },
        }
      : { statut: { in: [...STATUTS_VENTE_HORS_FILE] } };

  const ventes = await prisma.ventePharmacie.findMany({
    where,
    select: { dossierId: true },
  });
  return new Set(ventes.map((v) => v.dossierId));
}

/** Sort le dossier de la file pharmacie (paiement validé ou transmission caisse). */
export async function retirerDossierDeLaFilePharmacie(dossierId: string) {
  await prisma.fileAttente.updateMany({
    where: {
      serviLe: null,
      salle: { code: "PHARMACIE" },
      passage: { dossierId, statut: { not: "ANNULE" } },
    },
    data: { serviLe: new Date() },
  });
}

/** Aligne les ventes encore TRANSMISE/BROUILLON dont la facture est déjà payée. */
export async function synchroniserVentesPayeesDepuisFactures() {
  const aCorriger = await prisma.ventePharmacie.findMany({
    where: {
      statut: { in: ["BROUILLON", "TRANSMISE"] },
      facture: { is: { statut: "PAYEE" } },
    },
    select: { id: true, dossierId: true },
  });
  if (aCorriger.length === 0) return;

  await prisma.ventePharmacie.updateMany({
    where: { id: { in: aCorriger.map((v) => v.id) } },
    data: { statut: "PAYEE", payeeLe: new Date() },
  });

  const dossiers = [...new Set(aCorriger.map((v) => v.dossierId))];
  for (const dossierId of dossiers) {
    await retirerDossierDeLaFilePharmacie(dossierId);
  }
}
