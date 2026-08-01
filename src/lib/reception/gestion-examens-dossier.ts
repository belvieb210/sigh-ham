import "server-only";
import { prisma } from "@/lib/prisma";
import { mapperTypeExamen } from "@/lib/reception/rechercher-types-examen";
import type { TypeExamenReception } from "@/lib/reception/types";

async function chargerTransfertAvecExamens(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: true,
      recuperation: true,
      dossier: {
        include: {
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            include: { typeExamen: true },
          },
        },
      },
    },
  });

  if (!transfert) throw new Error("Transfert introuvable.");
  return transfert;
}

function estModifiable(transfert: Awaited<ReturnType<typeof chargerTransfertAvecExamens>>) {
  return (
    transfert.salleOrigine.code === "RECEPTION" &&
    transfert.statut === "EN_ATTENTE" &&
    transfert.recuperation?.statut !== "EN_RECUPERATION"
  );
}

function mapperExamensDossier(
  examens: Awaited<ReturnType<typeof chargerTransfertAvecExamens>>["dossier"]["examensLaboratoire"]
): TypeExamenReception[] {
  return examens.map((e) => mapperTypeExamen(e.typeExamen));
}

export async function listerExamensTransfert(transfertId: string) {
  const transfert = await chargerTransfertAvecExamens(transfertId);

  return {
    dossierId: transfert.dossierId,
    modifiable: estModifiable(transfert),
    examens: mapperExamensDossier(transfert.dossier.examensLaboratoire),
  };
}

export async function modifierExamensTransfert(
  agentId: string,
  transfertId: string,
  typeExamenIds: string[]
) {
  const transfert = await chargerTransfertAvecExamens(transfertId);

  if (!estModifiable(transfert)) {
    throw new Error(
      "Les examens ne peuvent être modifiés que pour un transfert en attente de confirmation."
    );
  }

  const dossierId = transfert.dossierId;
  const idsUniques = [...new Set(typeExamenIds)];

  return prisma.$transaction(async (tx) => {
    if (idsUniques.length > 0) {
      const types = await tx.typeExamen.findMany({
        where: { id: { in: idsUniques }, actif: true },
        select: { id: true },
      });
      if (types.length !== idsUniques.length) {
        throw new Error("Un ou plusieurs examens sélectionnés sont invalides.");
      }
    }

    const tousExamens = await tx.examenLaboratoire.findMany({
      where: { dossierId },
    });

    const idsDesires = new Set(idsUniques);
    const parType = new Map<string, (typeof tousExamens)[number][]>();

    for (const examen of tousExamens) {
      const liste = parType.get(examen.typeExamenId) ?? [];
      liste.push(examen);
      parType.set(examen.typeExamenId, liste);
    }

    for (const examen of tousExamens) {
      if (examen.statut !== "ANNULE" && !idsDesires.has(examen.typeExamenId)) {
        await tx.examenLaboratoire.update({
          where: { id: examen.id },
          data: { statut: "ANNULE" },
        });
      }
    }

    for (const typeId of idsUniques) {
      const existants = parType.get(typeId) ?? [];
      const actif = existants.find((e) => e.statut !== "ANNULE");
      if (actif) continue;

      const annule = existants.find((e) => e.statut === "ANNULE");
      if (annule) {
        await tx.examenLaboratoire.update({
          where: { id: annule.id },
          data: {
            statut: "PRESCRIT",
            prescripteurId: agentId,
            notes: "Prescrit à la réception — examens modifiés",
          },
        });
      } else {
        await tx.examenLaboratoire.create({
          data: {
            dossierId,
            typeExamenId: typeId,
            prescripteurId: agentId,
            statut: "PRESCRIT",
            notes: "Prescrit à la réception — examens modifiés",
          },
        });
      }
    }

    const examensMisAJour = await tx.examenLaboratoire.findMany({
      where: { dossierId, statut: { not: "ANNULE" } },
      include: { typeExamen: true },
    });

    return {
      dossierId,
      examensPrescrits: examensMisAJour.length,
      examens: mapperExamensDossier(examensMisAJour),
    };
  });
}
