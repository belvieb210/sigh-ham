import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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

async function chargerTransfertCaisse(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: true,
      salleDestination: true,
      passage: { include: { fileAttente: { include: { salle: true } } } },
      dossier: {
        include: {
          patient: true,
          factures: {
            where: { statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] } },
            select: { id: true, statut: true },
            take: 1,
          },
        },
      },
      recuperation: true,
    },
  });

  if (!transfert) throw new Error("Transfert introuvable.");
  if (transfert.salleOrigine.code !== "CAISSE") {
    throw new Error("Ce transfert ne peut être géré que depuis la caisse.");
  }

  return transfert;
}

function dossierAFactureEtablie(
  factures: { id: string }[]
): boolean {
  return factures.length > 0;
}

export async function confirmerTransfertCaisse(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertCaisse(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente de confirmation peuvent être confirmés.");
  }

  if (!dossierAFactureEtablie(transfert.dossier.factures)) {
    throw new Error(
      "Établissez d'abord la facture de ce patient avant de confirmer le transfert."
    );
  }

  if (!transfert.passageId) {
    throw new Error("Passage associé au transfert introuvable.");
  }

  return prisma.$transaction(async (tx) => {
    const fileCaisse = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: "CAISSE" },
      },
    });

    if (fileCaisse) {
      await tx.fileAttente.update({
        where: { id: fileCaisse.id },
        data: { serviLe: new Date() },
      });
    }

    const transfertEntrant = await tx.transfert.findFirst({
      where: {
        passageId: transfert.passageId!,
        salleDestination: { code: "CAISSE" },
        statut: { in: ["ACCEPTE", "EN_TRAITEMENT"] },
        id: { not: transfertId },
      },
      orderBy: { emisLe: "desc" },
    });

    if (transfertEntrant) {
      await tx.transfert.update({
        where: { id: transfertEntrant.id },
        data: {
          statut: "TERMINE",
          termineLe: new Date(),
          recepteurId: agentId,
        },
      });
    }

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
      data: {
        statut: "EN_ATTENTE",
        motif: `Transfert vers ${transfert.salleDestination.nom}`,
      },
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

export async function rejeterTransfertCaisse(
  agentId: string,
  transfertId: string,
  motifRejet?: string
) {
  const transfert = await chargerTransfertCaisse(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent être rejetés.");
  }

  if (!dossierAFactureEtablie(transfert.dossier.factures)) {
    throw new Error(
      "Établissez d'abord la facture de ce patient pour gérer ce transfert."
    );
  }

  if (transfert.recuperation?.statut === "EN_RECUPERATION") {
    throw new Error("Ce transfert est déjà en récupération.");
  }

  return prisma.$transaction(async (tx) => {
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
        examensIds: [],
        motifRejet: motifRejet?.trim() || "Transfert rejeté à la caisse",
        rejeteParId: agentId,
      },
      update: {
        statut: "EN_RECUPERATION",
        examensIds: [],
        motifRejet: motifRejet?.trim() || "Transfert rejeté à la caisse",
        rejeteParId: agentId,
        rejeteLe: new Date(),
        recupereParId: null,
        recupereLe: null,
      },
    });

    return {
      transfertId,
      numeroPatient: transfert.dossier.patient.numeroPatient,
    };
  });
}

export async function recupererTransfertCaisse(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertCaisse(transfertId);

  if (transfert.statut !== "REFUSE") {
    throw new Error("Seuls les transferts rejetés peuvent être restaurés.");
  }

  const recuperation = transfert.recuperation;
  if (!recuperation || recuperation.statut !== "EN_RECUPERATION") {
    throw new Error("Aucune donnée en récupération pour ce transfert.");
  }

  if (!dossierAFactureEtablie(transfert.dossier.factures)) {
    throw new Error(
      "Établissez d'abord la facture de ce patient pour restaurer ce transfert."
    );
  }

  return prisma.$transaction(async (tx) => {
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
    };
  });
}
