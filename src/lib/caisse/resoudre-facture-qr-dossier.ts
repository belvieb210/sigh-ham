import "server-only";

import type { Facture, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { estNumeroFacturePharmacie } from "@/lib/caisse/etat-facturation-dual";

const STATUTS_FACTURE_AFFICHABLES = [
  "PAYEE",
  "PARTIELLEMENT_PAYEE",
  "EMISE",
] as const;

type FactureAvecLignes = Facture & {
  lignes: { id: string; libelle: string; quantite: number; montant: Prisma.Decimal }[];
  ventePharmacie?: unknown;
};

function estFacturePharmacie(facture: {
  numeroFacture: string;
  ventePharmacie?: unknown;
}): boolean {
  return Boolean(
    facture.ventePharmacie || estNumeroFacturePharmacie(facture.numeroFacture)
  );
}

/** Facture « examens / prestations » la plus pertinente pour le QR du PDF labo (pas la dernière facture du dossier). */
export async function resoudreFactureExamensPourQr(
  dossierId: string
): Promise<FactureAvecLignes | null> {
  const factures = await prisma.facture.findMany({
    where: {
      dossierId,
      statut: { in: [...STATUTS_FACTURE_AFFICHABLES] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      lignes: { orderBy: { id: "asc" } },
      ventePharmacie: true,
    },
  });

  const facturesExamens = factures.filter((f) => !estFacturePharmacie(f));
  if (facturesExamens.length === 0) return null;

  return (
    facturesExamens.find((f) => f.statut === "PAYEE") ??
    facturesExamens.find((f) => f.statut === "PARTIELLEMENT_PAYEE") ??
    facturesExamens[0] ??
    null
  );
}

/** Facture pharmacie du même dossier (si encaissée ou émise). */
export async function resoudreFacturePharmaciePourQr(
  dossierId: string
): Promise<FactureAvecLignes | null> {
  const factures = await prisma.facture.findMany({
    where: {
      dossierId,
      statut: { in: [...STATUTS_FACTURE_AFFICHABLES] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      lignes: { orderBy: { id: "asc" } },
      ventePharmacie: true,
    },
  });

  return factures.find((f) => estFacturePharmacie(f)) ?? null;
}
