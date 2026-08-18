import "server-only";
import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
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

/**
 * La file labo ne se libère que lorsque le biologiste a fini ce dossier
 * (tous les examens Dr approuvés ou rejetés). Un simple « Valider »
 * (TERMINE / Vérifiés) ne doit pas faire disparaître la visite.
 */
async function libererFileLaboSiExamensTermines(dossierId: string) {
  const recuperation = await prisma.transfertRecuperation.findFirst({
    where: { dossierId, statut: "EN_RECUPERATION" },
    select: { id: true },
  });
  if (recuperation) return;

  const examens = await prisma.examenLaboratoire.findMany({
    where: { dossierId },
    select: { statut: true, notes: true },
  });
  if (examens.length === 0) return;

  const travailLaboFini = examens.every((e) => {
    if (e.statut === "ANNULE") return true;
    if (e.statut !== "TERMINE") return false;
    return lireOrientationAnalyseDepuisNotes(e.notes) === "DR_APPROUVE";
  });
  if (!travailLaboFini) return;

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
