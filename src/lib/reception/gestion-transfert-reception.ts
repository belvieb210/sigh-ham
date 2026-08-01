import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function inscrireFileAttenteDestination(
  tx: Prisma.TransactionClient,
  passageId: string,
  salleDestinationId: string
) {
  const existante = await tx.fileAttente.findUnique({ where: { passageId } });
  if (existante) return existante;

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

async function chargerTransfertReception(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: true,
      salleDestination: true,
      passage: { include: { fileAttente: true } },
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            select: { id: true },
          },
        },
      },
      recuperation: true,
    },
  });

  if (!transfert) throw new Error("Transfert introuvable.");
  if (transfert.salleOrigine.code !== "RECEPTION") {
    throw new Error("Ce transfert ne peut être géré que depuis la réception.");
  }

  return transfert;
}

export async function modifierDestinationTransfertReception(
  transfertId: string,
  codeSalle: string
) {
  const transfert = await chargerTransfertReception(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent changer de destination.");
  }

  const salle = await prisma.salle.findUnique({
    where: { code: codeSalle as import("@/generated/prisma/client").CodeSalle },
  });

  if (!salle) throw new Error("Salle de destination invalide.");

  if (salle.id === transfert.salleDestinationId) {
    return {
      transfertId,
      salleDestination: salle.nom,
      codeSalle: salle.code,
    };
  }

  await prisma.transfert.update({
    where: { id: transfertId },
    data: {
      salleDestinationId: salle.id,
      motif:
        transfert.motif === "Transfert manuel"
          ? "Transfert manuel"
          : `Transfert vers ${salle.nom}`,
    },
  });

  return {
    transfertId,
    salleDestination: salle.nom,
    codeSalle: salle.code,
  };
}

export async function confirmerTransfertReception(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertReception(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente de confirmation peuvent être confirmés.");
  }

  if (!transfert.passageId) {
    throw new Error("Passage associé au transfert introuvable.");
  }

  return prisma.$transaction(async (tx) => {
    const misAJour = await tx.transfert.update({
      where: { id: transfertId },
      data: {
        statut: "ACCEPTE",
        recepteurId: agentId,
        accepteLe: new Date(),
      },
    });

    await tx.passage.update({
      where: { id: transfert.passageId! },
      data: { statut: "EN_ATTENTE" },
    });

    await inscrireFileAttenteDestination(
      tx,
      transfert.passageId!,
      transfert.salleDestinationId
    );

    await tx.dossierPatient.update({
      where: { id: transfert.dossierId },
      data: { statut: "EN_COURS" },
    });

    return {
      transfertId: misAJour.id,
      numeroPatient: transfert.dossier.patient.numeroPatient,
      salleDestination: transfert.salleDestination.nom,
    };
  });
}

export async function rejeterTransfertReception(
  agentId: string,
  transfertId: string,
  motifRejet?: string
) {
  const transfert = await chargerTransfertReception(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent être rejetés.");
  }

  if (transfert.recuperation?.statut === "EN_RECUPERATION") {
    throw new Error("Ce transfert est déjà en récupération.");
  }

  const examensIds =
    transfert.dossier.examensLaboratoire.length > 0
      ? transfert.dossier.examensLaboratoire.map((e) => e.id)
      : (
          await prisma.examenLaboratoire.findMany({
            where: { dossierId: transfert.dossierId },
            select: { id: true },
          })
        ).map((e) => e.id);

  return prisma.$transaction(async (tx) => {
    if (examensIds.length > 0) {
      await tx.examenLaboratoire.updateMany({
        where: { id: { in: examensIds } },
        data: { statut: "ANNULE" },
      });
    }

    if (transfert.passage?.fileAttente) {
      await tx.fileAttente.delete({ where: { passageId: transfert.passageId! } });
    }

    await tx.transfert.update({
      where: { id: transfertId },
      data: { statut: "REFUSE" },
    });

    await tx.transfertRecuperation.upsert({
      where: { transfertId },
      create: {
        transfertId,
        dossierId: transfert.dossierId,
        patientId: transfert.dossier.patientId,
        examensIds,
        motifRejet: motifRejet?.trim() || "Transfert rejeté à la réception",
        rejeteParId: agentId,
      },
      update: {
        statut: "EN_RECUPERATION",
        examensIds,
        motifRejet: motifRejet?.trim() || "Transfert rejeté à la réception",
        rejeteParId: agentId,
        rejeteLe: new Date(),
        recupereParId: null,
        recupereLe: null,
      },
    });

    return {
      transfertId,
      numeroPatient: transfert.dossier.patient.numeroPatient,
      examensArchives: examensIds.length,
    };
  });
}

export async function recupererTransfertReception(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertReception(transfertId);

  if (transfert.statut !== "REFUSE") {
    throw new Error("Seuls les transferts rejetés peuvent être récupérés.");
  }

  const recuperation = transfert.recuperation;
  if (!recuperation || recuperation.statut !== "EN_RECUPERATION") {
    throw new Error("Aucune donnée en récupération pour ce transfert.");
  }

  return prisma.$transaction(async (tx) => {
    if (recuperation.examensIds.length > 0) {
      await tx.examenLaboratoire.updateMany({
        where: { id: { in: recuperation.examensIds } },
        data: { statut: "PRESCRIT" },
      });
    }

    await tx.transfert.update({
      where: { id: transfertId },
      data: {
        statut: "EN_ATTENTE",
        recepteurId: null,
        accepteLe: null,
      },
    });

    await tx.transfertRecuperation.update({
      where: { id: recuperation.id },
      data: {
        statut: "RECUPERE",
        recupereParId: agentId,
        recupereLe: new Date(),
      },
    });

    return {
      transfertId,
      numeroPatient: transfert.dossier.patient.numeroPatient,
      examensRestaures: recuperation.examensIds.length,
    };
  });
}
