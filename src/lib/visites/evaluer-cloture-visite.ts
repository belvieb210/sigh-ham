import "server-only";
import { prisma } from "@/lib/prisma";
import { cloturerVisiteSiPossible } from "@/lib/visites/etat-visite";

async function aucunTransfertSortantEnAttente(
  dossierId: string,
  salleId: string
): Promise<boolean> {
  const sortant = await prisma.transfert.findFirst({
    where: {
      dossierId,
      salleOrigineId: salleId,
      statut: "EN_ATTENTE",
    },
    select: { id: true },
  });
  return !sortant;
}

async function libererFileLaboSiExamensTermines(dossierId: string) {
  const recuperation = await prisma.transfertRecuperation.findFirst({
    where: { dossierId, statut: "EN_RECUPERATION" },
    select: { id: true },
  });
  if (recuperation) return;

  const [enCours, avecExamens] = await Promise.all([
    prisma.examenLaboratoire.count({
      where: {
        dossierId,
        statut: { notIn: ["TERMINE", "ANNULE"] },
      },
    }),
    prisma.examenLaboratoire.count({ where: { dossierId } }),
  ]);
  if (avecExamens === 0 || enCours > 0) return;

  const files = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: { dossierId, statut: { not: "ANNULE" } },
    },
    select: { id: true, salleId: true },
  });

  for (const file of files) {
    if (!(await aucunTransfertSortantEnAttente(dossierId, file.salleId))) continue;
    await prisma.fileAttente.update({
      where: { id: file.id },
      data: { serviLe: new Date() },
    });
  }
}

export async function libererFileCaisseSansSuite(dossierId: string) {
  const files = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
      salle: { code: "CAISSE" },
      passage: { dossierId, statut: { not: "ANNULE" } },
    },
    select: { id: true, salleId: true },
  });

  for (const file of files) {
    if (!(await aucunTransfertSortantEnAttente(dossierId, file.salleId))) continue;
    await prisma.fileAttente.update({
      where: { id: file.id },
      data: { serviLe: new Date() },
    });
  }
}

export async function libererFilePharmacieSiDelivre(dossierId: string) {
  const [ventesOuvertes, ordonnancesOuvertes] = await Promise.all([
    prisma.ventePharmacie.count({
      where: {
        dossierId,
        statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE"] },
      },
    }),
    prisma.ordonnance.count({
      where: {
        dossierId,
        statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
      },
    }),
  ]);
  if (ventesOuvertes > 0 || ordonnancesOuvertes > 0) return;

  const files = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
      salle: { code: "PHARMACIE" },
      passage: { dossierId, statut: { not: "ANNULE" } },
    },
    select: { id: true, salleId: true },
  });

  for (const file of files) {
    if (!(await aucunTransfertSortantEnAttente(dossierId, file.salleId))) continue;
    await prisma.fileAttente.update({
      where: { id: file.id },
      data: { serviLe: new Date() },
    });
  }
}

/**
 * Libère les files terminales (labo) si le travail est fini, puis clôture
 * la visite dès que le patient n'est plus dans le circuit.
 */
export async function evaluerEtCloturerVisite(dossierId: string): Promise<boolean> {
  try {
    await libererFileLaboSiExamensTermines(dossierId);
    return await cloturerVisiteSiPossible(dossierId);
  } catch (erreur) {
    console.error("[visites] évaluation clôture", dossierId, erreur);
    return false;
  }
}
