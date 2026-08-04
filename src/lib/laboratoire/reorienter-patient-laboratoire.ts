import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import {
  ORIENTATIONS_DESTINATION_LABO,
  type IdOrientationDestinationLabo,
} from "@/constants/laboratoire-orientations";
import { prisma } from "@/lib/prisma";

const CODE_PAR_ORIENTATION = Object.fromEntries(
  ORIENTATIONS_DESTINATION_LABO.map((o) => [o.id, o.codeSalle])
) as Record<IdOrientationDestinationLabo, CodeSalle>;

const ORIENTATIONS_AUTORISEES = new Set<string>(
  ORIENTATIONS_DESTINATION_LABO.map((o) => o.codeSalle)
);

export function codeSalleDepuisOrientationLabo(orientation: string): CodeSalle {
  const viaId = CODE_PAR_ORIENTATION[orientation as IdOrientationDestinationLabo];
  if (viaId) return viaId;
  if (ORIENTATIONS_AUTORISEES.has(orientation)) {
    return orientation as CodeSalle;
  }
  throw new Error("Salle de destination invalide.");
}

/**
 * Crée ou met à jour un transfert rapide depuis le laboratoire (EN_ATTENTE).
 * Le patient reste en file labo jusqu'à confirmation via le menu ⋮.
 */
export async function reorienterPatientDepuisLaboratoire(
  agentId: string,
  dossierId: string,
  orientation: string
) {
  const codeDestination = codeSalleDepuisOrientationLabo(orientation);

  if (codeDestination === "LABORATOIRE") {
    throw new Error("Le patient est déjà au laboratoire. Choisissez une autre destination.");
  }

  return prisma.$transaction(async (tx) => {
    const salleDestination = await tx.salle.findUnique({
      where: { code: codeDestination },
    });
    const salleOrigine = await tx.salle.findUnique({ where: { code: "LABORATOIRE" } });

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
            salle: { code: "LABORATOIRE" },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        fileAttente: true,
      },
    });

    if (!passage?.fileAttente) {
      throw new Error("Patient introuvable dans la file d'attente laboratoire.");
    }

    if (passage.fileAttente.serviLe) {
      throw new Error("Ce patient a déjà quitté la file laboratoire.");
    }

    const transfertEnAttente = await tx.transfert.findFirst({
      where: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: salleOrigine.id,
        statut: "EN_ATTENTE",
      },
      orderBy: { emisLe: "desc" },
    });

    if (transfertEnAttente) {
      const misAJour = await tx.transfert.update({
        where: { id: transfertEnAttente.id },
        data: {
          salleDestinationId: salleDestination.id,
          motif: `Orientation rapide laboratoire → ${salleDestination.nom}`,
          emetteurId: agentId,
        },
      });

      await tx.passage.update({
        where: { id: passage.id },
        data: { motif: `Transfert vers ${salleDestination.nom}` },
      });

      return {
        transfertId: misAJour.id,
        salleDestination: salleDestination.nom,
        codeSalle: salleDestination.code,
        transfertMisAJour: true,
      };
    }

    const transfertRefuse = await tx.transfert.findFirst({
      where: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: salleOrigine.id,
        statut: "REFUSE",
        recuperation: { statut: "EN_RECUPERATION" },
      },
      orderBy: { emisLe: "desc" },
    });

    if (transfertRefuse) {
      throw new Error(
        "Ce transfert a été rejeté. Restaurez-le via le menu d'actions avant de changer la destination."
      );
    }

    const transfert = await tx.transfert.create({
      data: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: salleOrigine.id,
        salleDestinationId: salleDestination.id,
        emetteurId: agentId,
        statut: "EN_ATTENTE",
        motif: `Orientation rapide laboratoire → ${salleDestination.nom}`,
      },
    });

    await tx.passage.update({
      where: { id: passage.id },
      data: {
        statut: "EN_ATTENTE",
        motif: `Transfert vers ${salleDestination.nom}`,
      },
    });

    return {
      transfertId: transfert.id,
      salleDestination: salleDestination.nom,
      codeSalle: salleDestination.code,
      transfertMisAJour: false,
    };
  });
}
