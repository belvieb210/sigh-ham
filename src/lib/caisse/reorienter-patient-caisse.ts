import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ORIENTATIONS_RAPIDES_CAISSE } from "@/constants/caisse";

export const ORIENTATIONS_CAISSE_AUTORISEES: CodeSalle[] = ORIENTATIONS_RAPIDES_CAISSE.map(
  (o) => o.value as CodeSalle
);

/**
 * Crée ou met à jour un transfert rapide depuis la caisse (EN_ATTENTE).
 * Le patient reste en file caisse jusqu'à confirmation (après facture).
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
      },
    });

    if (!passage?.fileAttente) {
      throw new Error("Patient introuvable dans la file d'attente caisse.");
    }

    if (passage.fileAttente.serviLe) {
      throw new Error("Ce patient a déjà quitté la file caisse.");
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
          motif: `Orientation rapide caisse → ${salleDestination.nom}`,
          emetteurId: caissierId,
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
        emetteurId: caissierId,
        statut: "EN_ATTENTE",
        motif: `Orientation rapide caisse → ${salleDestination.nom}`,
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
