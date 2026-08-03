import "server-only";
import type { CodeSalle, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ORIENTATIONS_RAPIDES_CAISSE } from "@/constants/caisse";

export const ORIENTATIONS_CAISSE_AUTORISEES: CodeSalle[] = ORIENTATIONS_RAPIDES_CAISSE.map(
  (o) => o.value as CodeSalle
);

async function inscrireFileAttenteDestination(
  tx: Prisma.TransactionClient,
  passageId: string,
  salleDestinationId: string
) {
  const existante = await tx.fileAttente.findUnique({ where: { passageId } });
  if (existante) {
    return tx.fileAttente.update({
      where: { passageId },
      data: {
        salleId: salleDestinationId,
        serviLe: null,
        arriveLe: new Date(),
      },
    });
  }

  const ordreMax = await tx.fileAttente.aggregate({
    where: { salleId: salleDestinationId },
    _max: { numeroOrdre: true },
  });

  return tx.fileAttente.create({
    data: {
      salleId: salleDestinationId,
      passageId,
      numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
    },
  });
}

/**
 * Oriente un patient présent à la caisse vers une autre salle
 * (termine le transfert caisse courant et crée le suivant).
 */
export async function reorienterPatientDepuisCaisse(
  caissierId: string,
  dossierId: string,
  codeDestination: string
) {
  if (!ORIENTATIONS_CAISSE_AUTORISEES.includes(codeDestination as CodeSalle)) {
    throw new Error("Salle de destination invalide.");
  }

  if (codeDestination === "CAISSE") {
    throw new Error("Le patient est déjà à la caisse. Choisissez une autre destination.");
  }

  return prisma.$transaction(async (tx) => {
    const salleDestination = await tx.salle.findUnique({
      where: { code: codeDestination as CodeSalle },
    });
    const salleOrigine = await tx.salle.findUnique({ where: { code: "CAISSE" } });

    if (!salleDestination || !salleOrigine) {
      throw new Error("Salle introuvable.");
    }

    const passage = await tx.passage.findFirst({
      where: {
        dossierId,
        statut: { not: "ANNULE" },
        fileAttente: {
          is: {
            serviLe: null,
            salle: { code: "CAISSE" },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        fileAttente: true,
        transferts: {
          where: {
            salleDestination: { code: "CAISSE" },
            statut: { in: ["ACCEPTE", "EN_TRAITEMENT"] },
          },
          orderBy: { emisLe: "desc" },
          take: 1,
        },
      },
    });

    if (!passage?.fileAttente) {
      throw new Error("Patient introuvable dans la file d'attente caisse.");
    }

    if (passage.fileAttente.serviLe) {
      throw new Error("Ce patient a déjà quitté la file caisse.");
    }

    await tx.fileAttente.update({
      where: { id: passage.fileAttente.id },
      data: { serviLe: new Date() },
    });

    if (passage.transferts[0]) {
      await tx.transfert.update({
        where: { id: passage.transferts[0].id },
        data: {
          statut: "TERMINE",
          termineLe: new Date(),
          recepteurId: caissierId,
        },
      });
    }

    const transfert = await tx.transfert.create({
      data: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: salleOrigine.id,
        salleDestinationId: salleDestination.id,
        emetteurId: caissierId,
        statut: "ACCEPTE",
        motif: `Orientation rapide caisse → ${salleDestination.nom}`,
        accepteLe: new Date(),
        recepteurId: caissierId,
      },
    });

    await tx.passage.update({
      where: { id: passage.id },
      data: {
        statut: "EN_ATTENTE",
        motif: `Transfert vers ${salleDestination.nom}`,
      },
    });

    await inscrireFileAttenteDestination(tx, passage.id, salleDestination.id);

    return {
      transfertId: transfert.id,
      salleDestination: salleDestination.nom,
      codeSalle: salleDestination.code,
    };
  });
}
