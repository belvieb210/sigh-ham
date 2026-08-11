import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  estNumeroFacturePharmacie,
  evaluerEtatFacturationDual,
} from "@/lib/caisse/etat-facturation-dual";

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
      passage: { dossierId },
    },
    select: { id: true },
  });
  if (enFile) return true;

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: {
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        select: { id: true },
      },
      factures: {
        where: {
          statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
        },
        select: {
          statut: true,
          numeroFacture: true,
          ventePharmacie: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      ordonnances: {
        where: {
          statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
          lignes: { some: {} },
        },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!dossier || dossier.examensLaboratoire.length === 0) return false;

  const facs = classerFacturesDossier(dossier.factures);
  const etat = evaluerEtatFacturationDual({
    nombreExamens: dossier.examensLaboratoire.length,
    aDesMedicaments: dossier.ordonnances.length > 0,
    statutFactureExamens: facs.examens,
    statutFacturePharmacie: facs.pharmacie,
    enFile: false,
  });

  return etat.factureExamensPayee;
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
