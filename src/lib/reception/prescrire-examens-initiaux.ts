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
  EGLISE: {
    normal: "Prescrit au service Église — examens initiaux",
    estimation: "Prescrit au service Église — estimation",
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
  salleOrigine: CodeSalle = "RECEPTION",
  paquetsBilanIds: string[] = []
) {
  let total = 0;
  const idsDansPaquets = new Set<string>();
  const note = noteExamen(salleOrigine, estEstimation);

  for (const paquetId of [...new Set(paquetsBilanIds)]) {
    const paquet = await tx.paquetBilan.findFirst({
      where: { id: paquetId, actif: true },
      include: {
        examens: {
          orderBy: { ordre: "asc" },
          select: { typeExamenId: true },
        },
      },
    });
    if (!paquet) {
      throw new Error("Un paquet bilan sélectionné est invalide ou inactif.");
    }

    for (const lien of paquet.examens) {
      idsDansPaquets.add(lien.typeExamenId);
      const deja = await tx.examenLaboratoire.findFirst({
        where: {
          dossierId,
          typeExamenId: lien.typeExamenId,
          statut: { not: "ANNULE" },
        },
        select: { id: true },
      });
      if (deja) continue;

      await tx.examenLaboratoire.create({
        data: {
          dossierId,
          typeExamenId: lien.typeExamenId,
          prescripteurId: agentId,
          statut: "PRESCRIT",
          notes: note,
          paquetBilanId: paquet.id,
        },
      });
      total += 1;
    }
  }

  const idsExamensHorsPaquet = [...new Set(idsExamens)].filter(
    (id) => !idsDansPaquets.has(id)
  );

  if (idsExamensHorsPaquet.length === 0) return total;

  const typesExamens = await tx.typeExamen.findMany({
    where: { id: { in: idsExamensHorsPaquet }, actif: true },
    select: { id: true },
  });

  if (typesExamens.length !== idsExamensHorsPaquet.length) {
    throw new Error("Un ou plusieurs examens sélectionnés sont invalides.");
  }

  const dejaPrescrits = await tx.examenLaboratoire.findMany({
    where: { dossierId, typeExamenId: { in: idsExamensHorsPaquet } },
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

  return total + nouveaux.length;
}
