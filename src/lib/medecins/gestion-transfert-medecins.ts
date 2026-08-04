import "server-only";
import { prisma } from "@/lib/prisma";

async function chargerTransfertMedecins(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: true,
      salleDestination: true,
      passage: { include: { fileAttente: { include: { salle: true } } } },
      dossier: {
        include: {
          patient: true,
        },
      },
      recuperation: true,
    },
  });

  if (!transfert) throw new Error("Transfert introuvable.");
  if (transfert.salleOrigine.code !== "MEDECINS") {
    throw new Error("Ce transfert ne peut être géré que depuis la salle médecins.");
  }

  return transfert;
}

export async function confirmerTransfertMedecins(
  agentId: string,
  transfertId: string
) {
  const transfert = await chargerTransfertMedecins(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error(
      "Seuls les transferts en attente de confirmation peuvent être confirmés."
    );
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
    const fileMedecins = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: "MEDECINS" },
      },
    });

    if (fileMedecins) {
      await tx.fileAttente.update({
        where: { id: fileMedecins.id },
        data: { serviLe: new Date() },
      });
    }

    const transfertEntrant = await tx.transfert.findFirst({
      where: {
        passageId: transfert.passageId!,
        salleDestination: { code: "MEDECINS" },
        statut: { in: ["ACCEPTE", "EN_TRAITEMENT"] },
        id: { notIn: aConfirmer.map((t) => t.id) },
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

  return resultat;
}

export async function rejeterTransfertMedecins(
  agentId: string,
  transfertId: string,
  motifRejet?: string
) {
  const transfert = await chargerTransfertMedecins(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent être rejetés.");
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
        motifRejet: motifRejet?.trim() || "Transfert rejeté chez les médecins",
        rejeteParId: agentId,
      },
      update: {
        statut: "EN_RECUPERATION",
        examensIds: [],
        motifRejet: motifRejet?.trim() || "Transfert rejeté chez les médecins",
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

export async function restaurerTransfertMedecins(
  agentId: string,
  transfertId: string
) {
  const transfert = await chargerTransfertMedecins(transfertId);

  if (transfert.statut !== "REFUSE") {
    throw new Error("Seuls les transferts rejetés peuvent être restaurés.");
  }

  const recuperation = transfert.recuperation;
  if (!recuperation || recuperation.statut !== "EN_RECUPERATION") {
    throw new Error("Aucune donnée en récupération pour ce transfert.");
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
