import "server-only";
import type { CodeSalle, Prisma } from "@/generated/prisma/client";

const NOTES_PAR_ORIGINE: Partial<Record<CodeSalle, { normal: string; estimation: string }>> = {
  RECEPTION: {
    normal: "Prescrit à la réception — examens initiaux",
    estimation: "Prescrit à la réception — estimation",
  },
  MEDECINS_EXTERNES: {
    normal: "Prescrit chez le médecin externe — examens initiaux",
    estimation: "Prescrit chez le médecin externe — estimation",
  },
};

function noteExamen(salleOrigine: CodeSalle, estEstimation: boolean): string {
  const notes = NOTES_PAR_ORIGINE[salleOrigine] ?? NOTES_PAR_ORIGINE.RECEPTION!;
  return estEstimation ? notes.estimation : notes.normal;
}

export async function prescrireExamensInitiaux(
  tx: Prisma.TransactionClient,
  dossierId: string,
  agentId: string,
  idsExamens: string[],
  estEstimation: boolean,
  salleOrigine: CodeSalle = "RECEPTION"
) {
  if (idsExamens.length === 0) return 0;

  const typesExamens = await tx.typeExamen.findMany({
    where: { id: { in: idsExamens }, actif: true },
    select: { id: true },
  });

  if (typesExamens.length !== idsExamens.length) {
    throw new Error("Un ou plusieurs examens sélectionnés sont invalides.");
  }

  const note = noteExamen(salleOrigine, estEstimation);

  const dejaPrescrits = await tx.examenLaboratoire.findMany({
    where: { dossierId, typeExamenId: { in: idsExamens } },
    select: { typeExamenId: true },
  });
  const idsDejaPrescrits = new Set(dejaPrescrits.map((e) => e.typeExamenId));
  const nouveaux = typesExamens.filter((type) => !idsDejaPrescrits.has(type.id));

  if (nouveaux.length > 0) {
    await tx.examenLaboratoire.createMany({
      data: nouveaux.map((type) => ({
        dossierId,
        typeExamenId: type.id,
        prescripteurId: agentId,
        statut: "PRESCRIT" as const,
        notes: note,
      })),
    });
  }

  return nouveaux.length;
}
