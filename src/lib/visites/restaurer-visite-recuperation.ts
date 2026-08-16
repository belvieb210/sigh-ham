import "server-only";
import type { Prisma } from "@/generated/prisma/client";

const STATUTS_EXAMENS_EN_COURS = ["PRESCRIT", "PRELEVE", "EN_ANALYSE"] as const;

/** Examens encore en cours sur CETTE visite uniquement (pas les visites suivantes). */
export async function idsExamensEnCoursDuDossier(
  tx: Prisma.TransactionClient,
  dossierId: string
): Promise<string[]> {
  const rows = await tx.examenLaboratoire.findMany({
    where: {
      dossierId,
      statut: { in: [...STATUTS_EXAMENS_EN_COURS] },
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/**
 * Après rejet + récupération : uniquement cette VIS, uniquement les examens
 * annulés par ce rejet. Les autres visites du même patient restent intactes.
 */
export async function restaurerVisiteApresRecuperation(
  tx: Prisma.TransactionClient,
  params: {
    dossierId: string;
    passageId: string | null;
    examensIds: string[];
  }
) {
  if (params.examensIds.length > 0) {
    await tx.examenLaboratoire.updateMany({
      where: {
        id: { in: params.examensIds },
        dossierId: params.dossierId,
        statut: "ANNULE",
      },
      data: { statut: "PRESCRIT" },
    });
  }

  await tx.dossierPatient.update({
    where: { id: params.dossierId },
    data: { statut: "EN_COURS", clotureLe: null },
  });

  if (!params.passageId) return;

  const passage = await tx.passage.findFirst({
    where: { id: params.passageId, dossierId: params.dossierId },
    select: { id: true },
  });
  if (!passage) return;

  await tx.passage.update({
    where: { id: passage.id },
    data: { statut: "EN_ATTENTE", finLe: null },
  });
}
