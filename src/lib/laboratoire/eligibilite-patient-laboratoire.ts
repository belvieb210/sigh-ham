import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { estNumeroFacturePharmacie } from "@/lib/caisse/etat-facturation-dual";
import { filtreTransfertVisibleSalle } from "@/lib/transferts/visibilite-salle";

interface ResumeFactureDossier {
  examens: StatutFacture | null;
  pharmacie: StatutFacture | null;
}

export function classerFacturesDossier(
  factures: {
    statut: StatutFacture;
    numeroFacture: string;
    ventePharmacie: { id: string } | null;
  }[]
): ResumeFactureDossier {
  let examens: StatutFacture | null = null;
  let pharmacie: StatutFacture | null = null;

  for (const f of factures) {
    const estPh =
      Boolean(f.ventePharmacie) || estNumeroFacturePharmacie(f.numeroFacture);
    if (estPh) {
      if (!pharmacie) pharmacie = f.statut;
    } else if (!examens) {
      examens = f.statut;
    }
  }

  return { examens, pharmacie };
}

/** Dossier avec examens labo dont la facture examens (caisse) est payée. */
export async function dossierEligibleLaboratoire(
  dossierId: string
): Promise<boolean> {
  const enFile = await prisma.fileAttente.findFirst({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: {
        dossierId,
        transferts: { some: filtreTransfertVisibleSalle("LABORATOIRE") },
      },
    },
    select: { id: true },
  });
  if (enFile) return true;

  return false;
}

export function filtrePrismaDossiersExamensPayes() {
  return {
    examensLaboratoire: { some: { statut: { not: "ANNULE" as const } } },
    factures: {
      some: {
        statut: "PAYEE" as const,
        numeroFacture: { not: { startsWith: "FAC-PH-" } },
      },
    },
  } as const;
}
