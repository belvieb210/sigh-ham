import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { idsExamensEnCoursDuDossier, restaurerVisiteApresRecuperation } from "@/lib/visites/restaurer-visite-recuperation";

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

  const freres = await prisma.transfert.findMany({
    where: {
      dossierId: transfert.dossierId,
      passageId: transfert.passageId,
      salleOrigineId: transfert.salleOrigineId,
      statut: "EN_ATTENTE",
    },
    include: { salleDestination: true },
    orderBy: { emisLe: "asc" },
  });
  const aConfirmer = freres.length > 0 ? freres : [transfert];
  const { inscrirePassagesDansSalles } = await import(
    "@/lib/transferts/multi-destinations"
  );

  const resultat = await prisma.$transaction(async (tx) => {
    const fileReception = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: "RECEPTION" },
      },
    });

    if (fileReception) {
      await tx.fileAttente.update({
        where: { id: fileReception.id },
        data: { serviLe: new Date() },
      });
    }

    const inscriptions = await inscrirePassagesDansSalles(tx, {
      passageOrigineId: transfert.passageId!,
      dossierId: transfert.dossierId,
      sallesDestinationIds: aConfirmer.map((t) => t.salleDestinationId),
      motifBase: `Transfert vers ${aConfirmer.map((t) => t.salleDestination.nom).join(", ")}`,
    });

    for (let i = 0; i < aConfirmer.length; i++) {
      const t = aConfirmer[i]!;
      const inscription = inscriptions[i]!;
      await tx.transfert.update({
        where: { id: t.id },
        data: {
          statut: "ACCEPTE",
          recepteurId: agentId,
          accepteLe: new Date(),
          passageId: inscription.passageId,
        },
      });
    }

    await tx.dossierPatient.update({
      where: { id: transfert.dossierId },
      data: { statut: "EN_COURS" },
    });

    return {
      transfertId: aConfirmer[0]!.id,
      transfertIds: aConfirmer.map((t) => t.id),
      numeroPatient: transfert.dossier.patient.numeroPatient,
      salleDestination: aConfirmer.map((t) => t.salleDestination.nom).join(", "),
    };
  });

  const { evenementPatientTransfere } = await import(
    "@/lib/notifications/evenements-metier"
  );
  for (const t of aConfirmer) {
    void evenementPatientTransfere({
      patientId: transfert.dossier.patientId,
      prenom: transfert.dossier.patient.prenom,
      nom: transfert.dossier.patient.nom,
      numeroPatient: transfert.dossier.patient.numeroPatient,
      salleDestination: t.salleDestination.code,
      transfertId: t.id,
    });
  }

  void import("@/lib/visites/evaluer-cloture-visite").then(({ evaluerEtCloturerVisite }) =>
    evaluerEtCloturerVisite(transfert.dossierId)
  );

  return resultat;
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

  return prisma.$transaction(async (tx) => {
    const examensIds = await idsExamensEnCoursDuDossier(tx, transfert.dossierId);

    if (examensIds.length > 0) {
      await tx.examenLaboratoire.updateMany({
        where: { id: { in: examensIds }, dossierId: transfert.dossierId },
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
    await restaurerVisiteApresRecuperation(tx, {
      dossierId: transfert.dossierId,
      passageId: transfert.passageId,
      examensIds: recuperation.examensIds,
    });

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
