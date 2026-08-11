import "server-only";
import type { StatutFacture, StatutOrdonnance } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  estNumeroFacturePharmacie,
  evaluerEtatFacturationDual,
  factureEstPayee,
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

export function evaluerFacturationValideeLaboratoire(params: {
  nombreExamens: number;
  aDesMedicaments: boolean;
  statutFactureExamens: StatutFacture | null;
  statutFacturePharmacie: StatutFacture | null;
}) {
  const etat = evaluerEtatFacturationDual({
    ...params,
    enFile: false,
  });

  /** Au moins un examen labo + facture examens payée (cas le plus courant). */
  const examensPayes =
    etat.aDesExamens && factureEstPayee(params.statutFactureExamens);

  /**
   * Double facturation : examens + pharmacie — visible quand les deux côtés sont payés.
   */
  const doubleFacturationComplete =
    etat.aDesExamens && etat.aDesMedicaments && etat.facturationComplete;

  return {
    ...etat,
    eligible: examensPayes || doubleFacturationComplete,
  };
}

/** Dossier avec examens labo et facturation validée (examens payés ou double facturation complète). */
export async function dossierFacturationValideeLaboratoire(
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
    select: selectEligibiliteDossier(),
  });

  if (!dossier || dossier.examensLaboratoire.length === 0) return false;

  const facs = classerFacturesDossier(dossier.factures);
  return evaluerFacturationValideeLaboratoire({
    nombreExamens: dossier.examensLaboratoire.length,
    aDesMedicaments: dossier.ordonnances.length > 0,
    statutFactureExamens: facs.examens,
    statutFacturePharmacie: facs.pharmacie,
  }).eligible;
}

/** @deprecated Utiliser dossierFacturationValideeLaboratoire */
export async function dossierEligibleLaboratoire(
  dossierId: string
): Promise<boolean> {
  return dossierFacturationValideeLaboratoire(dossierId);
}

function selectEligibiliteDossier() {
  return {
    examensLaboratoire: {
      where: { statut: { not: "ANNULE" as const } },
      select: { id: true },
    },
    factures: {
      where: {
        statut: {
          in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] as StatutFacture[],
        },
      },
      select: {
        statut: true,
        numeroFacture: true,
        ventePharmacie: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" as const },
    },
    ordonnances: {
      where: {
        statut: {
          in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] as StatutOrdonnance[],
        },
        lignes: { some: {} },
      },
      select: { id: true },
      take: 1,
    },
  };
}

/** Dossiers payés (examens ou double facturation) pas encore visibles en file labo. */
export async function listerDossiersPayesHorsFileLaboratoire(
  exclus: string[] = []
): Promise<string[]> {
  const candidats = await prisma.dossierPatient.findMany({
    where: {
      ...(exclus.length > 0 ? { id: { notIn: exclus } } : {}),
      examensLaboratoire: { some: { statut: { not: "ANNULE" } } },
      OR: [
        {
          factures: {
            some: {
              statut: "PAYEE",
              numeroFacture: { not: { startsWith: "FAC-PH-" } },
              ventePharmacie: null,
            },
          },
        },
        {
          AND: [
            {
              factures: {
                some: {
                  statut: "PAYEE",
                  numeroFacture: { not: { startsWith: "FAC-PH-" } },
                  ventePharmacie: null,
                },
              },
            },
            {
              factures: {
                some: {
                  statut: "PAYEE",
                  OR: [
                    { ventePharmacie: { isNot: null } },
                    { numeroFacture: { startsWith: "FAC-PH-" } },
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    select: { id: true, ...selectEligibiliteDossier() },
  });

  return candidats
    .filter((d) =>
      evaluerFacturationValideeLaboratoire({
        nombreExamens: d.examensLaboratoire.length,
        aDesMedicaments: d.ordonnances.length > 0,
        statutFactureExamens: classerFacturesDossier(d.factures).examens,
        statutFacturePharmacie: classerFacturesDossier(d.factures).pharmacie,
      }).eligible
    )
    .map((d) => d.id);
}

/**
 * Inscrit en file laboratoire un dossier dont la facture est validée
 * (confirme le transfert caisse→labo en attente ou ouvre la file directement).
 */
export async function assurerInscriptionLaboratoireDossierPaye(
  dossierId: string,
  agentId?: string
): Promise<boolean> {
  const eligible = await dossierFacturationValideeLaboratoire(dossierId);
  if (!eligible) return false;

  const dejaEnFile = await prisma.fileAttente.findFirst({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: { dossierId },
    },
    select: { id: true },
  });
  if (dejaEnFile) return true;

  const salleLabo = await prisma.salle.findUnique({ where: { code: "LABORATOIRE" } });
  if (!salleLabo) return false;

  const passage = await prisma.passage.findFirst({
    where: { dossierId, statut: { not: "ANNULE" } },
    orderBy: { createdAt: "desc" },
  });
  if (!passage) return false;

  let emetteurId = agentId;
  if (!emetteurId) {
    const transfertEnAttente = await prisma.transfert.findFirst({
      where: {
        dossierId,
        statut: "EN_ATTENTE",
        salleDestination: { code: "LABORATOIRE" },
      },
      orderBy: { emisLe: "desc" },
      select: { emetteurId: true },
    });
    emetteurId = transfertEnAttente?.emetteurId;
  }
  if (!emetteurId) {
    const dernierPaiement = await prisma.paiement.findFirst({
      where: {
        facture: {
          dossierId,
          statut: "PAYEE",
          numeroFacture: { not: { startsWith: "FAC-PH-" } },
        },
      },
      orderBy: { payeLe: "desc" },
      select: { caissierId: true },
    });
    emetteurId = dernierPaiement?.caissierId;
  }
  if (!emetteurId) {
    const agentLabo = await prisma.utilisateur.findFirst({
      where: { role: { code: "LABORANTIN" }, statut: "ACTIF" },
      select: { id: true },
    });
    emetteurId = agentLabo?.id;
  }
  if (!emetteurId) return false;

  const salleCaisse = await prisma.salle.findUnique({ where: { code: "CAISSE" } });

  await prisma.$transaction(async (tx) => {
    const { assurerFileAttenteDestination } = await import(
      "@/lib/transferts/multi-destinations"
    );
    await assurerFileAttenteDestination(tx, passage.id, salleLabo.id);

    if (salleCaisse) {
      const entrant = await tx.transfert.findFirst({
        where: {
          dossierId,
          passageId: passage.id,
          salleDestinationId: salleLabo.id,
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
        },
      });
      if (!entrant) {
        await tx.transfert.create({
          data: {
            dossierId,
            passageId: passage.id,
            salleOrigineId: salleCaisse.id,
            salleDestinationId: salleLabo.id,
            statut: "ACCEPTE",
            emetteurId,
            recepteurId: emetteurId,
            accepteLe: new Date(),
            motif: "Facture validée — admission laboratoire",
          },
        });
      }
    }
  });

  return true;
}

/** Synchronise tous les dossiers payés non encore en file laboratoire. */
export async function synchroniserDossiersPayesLaboratoire(): Promise<number> {
  const enFile = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
    },
    select: { passage: { select: { dossierId: true } } },
  });
  const exclus = enFile.map((f) => f.passage.dossierId);
  const dossierIds = await listerDossiersPayesHorsFileLaboratoire(exclus);

  let inscrits = 0;
  for (const dossierId of dossierIds) {
    try {
      const ok = await assurerInscriptionLaboratoireDossierPaye(dossierId);
      if (ok) inscrits++;
    } catch (e) {
      console.error("[synchroniserDossiersPayesLaboratoire]", dossierId, e);
    }
  }
  return inscrits;
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
