import "server-only";
import type { Prisma, StatutDossier } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ResumeVisitePatient = {
  dossierId: string;
  numeroVisite: string;
  statut: StatutDossier;
  reutilisable: boolean;
  salleEnCoursNom: string | null;
};

const STATUTS_TRANSFERT_CONFIRMES = ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] as const;
const STATUTS_TRANSFERT_EN_VOL = ["EN_ATTENTE", "ACCEPTE", "EN_TRAITEMENT"] as const;

export async function dossierATransfertInterSalleConfirme(
  tx: Prisma.TransactionClient | typeof prisma,
  dossierId: string
): Promise<boolean> {
  const confirmes = await tx.transfert.findMany({
    where: {
      dossierId,
      statut: { in: [...STATUTS_TRANSFERT_CONFIRMES] },
    },
    select: { salleOrigineId: true, salleDestinationId: true },
  });
  return confirmes.some((t) => t.salleOrigineId !== t.salleDestinationId);
}

export async function dossierEstReutilisableAccueil(
  dossierId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<boolean> {
  const dossier = await tx.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { id: true, statut: true },
  });
  if (!dossier) return false;
  if (dossier.statut === "CLOTURE" || dossier.statut === "ARCHIVE") return false;
  if (dossier.statut !== "OUVERT" && dossier.statut !== "EN_COURS") return false;

  const [transfert, examen] = await Promise.all([
    tx.transfert.findFirst({
      where: { dossierId, statut: { not: "ANNULE" } },
      select: { id: true },
    }),
    tx.examenLaboratoire.findFirst({
      where: { dossierId },
      select: { id: true },
    }),
  ]);
  if (transfert || examen) return false;
  return true;
}

export async function visiteEstOccupee(
  dossierId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<boolean> {
  const [fileActive, transfertEnVol, recuperation, admission] = await Promise.all([
    tx.fileAttente.findFirst({
      where: {
        serviLe: null,
        passage: { dossierId, statut: { not: "ANNULE" } },
      },
      select: { id: true },
    }),
    tx.transfert.findFirst({
      where: {
        dossierId,
        statut: { in: [...STATUTS_TRANSFERT_EN_VOL] },
      },
      select: { id: true },
    }),
    tx.transfertRecuperation.findFirst({
      where: { dossierId, statut: "EN_RECUPERATION" },
      select: { id: true },
    }),
    tx.admission.findFirst({
      where: {
        dossierId,
        sortiLe: null,
        statut: { in: ["ADMIS", "EN_SOINS"] },
      },
      select: { id: true },
    }),
  ]);

  return Boolean(fileActive || transfertEnVol || recuperation || admission);
}

export async function cloturerVisiteSiPossible(
  dossierId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<boolean> {
  const dossier = await tx.dossierPatient.findUnique({
    where: { id: dossierId },
    select: { statut: true },
  });
  if (!dossier || dossier.statut === "CLOTURE" || dossier.statut === "ARCHIVE") {
    return false;
  }
  if (await visiteEstOccupee(dossierId, tx)) return false;

  await tx.dossierPatient.update({
    where: { id: dossierId },
    data: { statut: "CLOTURE", clotureLe: new Date() },
  });
  await tx.passage.updateMany({
    where: { dossierId, statut: { notIn: ["ANNULE", "TERMINE"] } },
    data: { statut: "TERMINE", finLe: new Date() },
  });
  return true;
}

export async function chargerResumeDerniereVisite(
  patientId: string
): Promise<ResumeVisitePatient | null> {
  const dossier = await prisma.dossierPatient.findFirst({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      numeroDossier: true,
      statut: true,
      passages: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          fileAttente: {
            select: { serviLe: true, salle: { select: { nom: true } } },
          },
        },
      },
    },
  });
  if (!dossier) return null;

  const file = dossier.passages[0]?.fileAttente;
  const salleEnCoursNom =
    file && file.serviLe == null ? file.salle.nom : null;
  const reutilisable = await dossierEstReutilisableAccueil(dossier.id);

  return {
    dossierId: dossier.id,
    numeroVisite: dossier.numeroDossier,
    statut: dossier.statut,
    reutilisable,
    salleEnCoursNom,
  };
}
