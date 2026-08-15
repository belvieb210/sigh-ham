import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  estNumeroFacturePharmacie,
  evaluerEtatFacturationDual,
  factureEstPayee,
} from "@/lib/caisse/etat-facturation-dual";

function prioriteStatutFacture(statut: StatutFacture): number {
  if (statut === "PAYEE") return 4;
  if (statut === "PARTIELLEMENT_PAYEE") return 3;
  if (statut === "EMISE") return 2;
  if (statut === "BROUILLON") return 1;
  return 0;
}

/**
 * Indique si le dossier a au moins une facture payée (examens ou pharmacie)
 * ou une facturation dual complète — condition d'affichage page transferts caisse.
 */
export async function dossierEstFacturePayeePourTransfert(
  dossierId: string
): Promise<boolean> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    select: {
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        select: { id: true },
      },
    },
  });
  if (!dossier) return false;

  const [factures, ordonnanceMedicaments] = await Promise.all([
    prisma.facture.findMany({
      where: {
        dossierId,
        statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
      },
      select: {
        statut: true,
        numeroFacture: true,
        ventePharmacie: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ordonnance.findFirst({
      where: {
        dossierId,
        statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
        lignes: { some: {} },
      },
      select: { id: true },
    }),
  ]);

  let statutExamens: StatutFacture | null = null;
  let statutPharmacie: StatutFacture | null = null;

  for (const f of factures) {
    const estPh =
      Boolean(f.ventePharmacie) || estNumeroFacturePharmacie(f.numeroFacture);
    if (estPh) {
      if (
        !statutPharmacie ||
        prioriteStatutFacture(f.statut) >= prioriteStatutFacture(statutPharmacie)
      ) {
        statutPharmacie = f.statut;
      }
    } else if (
      !statutExamens ||
      prioriteStatutFacture(f.statut) >= prioriteStatutFacture(statutExamens)
    ) {
      statutExamens = f.statut;
    }
  }

  const aDesMedicaments =
    Boolean(ordonnanceMedicaments) ||
    factures.some(
      (f) => Boolean(f.ventePharmacie) || estNumeroFacturePharmacie(f.numeroFacture)
    );

  const etat = evaluerEtatFacturationDual({
    nombreExamens: dossier.examensLaboratoire.length,
    aDesMedicaments,
    statutFactureExamens: statutExamens,
    statutFacturePharmacie: statutPharmacie,
    enFile: true,
  });

  return (
    etat.facturationComplete ||
    factureEstPayee(statutExamens) ||
    factureEstPayee(statutPharmacie)
  );
}
