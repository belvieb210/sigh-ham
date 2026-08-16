import "server-only";
import { prisma } from "@/lib/prisma";

async function chargerTransfertEntrantCaisse(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: true,
      salleDestination: true,
      passage: { include: { fileAttente: { include: { salle: true } } } },
      dossier: { include: { patient: true } },
      recuperation: true,
    },
  });

  if (!transfert) throw new Error("Transfert introuvable.");
  if (transfert.salleDestination.code !== "CAISSE") {
    throw new Error("Ce transfert ne concerne pas la caisse.");
  }

  return transfert;
}

/** Accepte un patient transféré vers la caisse (visible en file après confirmation). */
export async function confirmerTransfertEntrantCaisse(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertEntrantCaisse(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent être confirmés.");
  }

  if (!transfert.passageId) {
    throw new Error("Passage associé au transfert introuvable.");
  }

  const freres = await prisma.transfert.findMany({
    where: {
      dossierId: transfert.dossierId,
      passageId: transfert.passageId,
      salleDestination: { code: "CAISSE" },
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
    const fileOrigine = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: transfert.salleOrigine.code },
      },
    });

    if (fileOrigine) {
      await tx.fileAttente.update({
        where: { id: fileOrigine.id },
        data: { serviLe: new Date() },
      });
    }

    const inscriptions = await inscrirePassagesDansSalles(tx, {
      passageOrigineId: transfert.passageId!,
      dossierId: transfert.dossierId,
      sallesDestinationIds: [aConfirmer[0]!.salleDestinationId],
      motifBase: `Arrivée caisse depuis ${transfert.salleOrigine.nom}`,
    });

    for (let i = 0; i < aConfirmer.length; i++) {
      const t = aConfirmer[i]!;
      const inscription = inscriptions[i] ?? inscriptions[0]!;
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
      numeroPatient: transfert.dossier.patient.numeroPatient,
      salleDestination: transfert.salleDestination.nom,
    };
  });

  return resultat;
}

export async function rejeterTransfertEntrantCaisse(
  agentId: string,
  transfertId: string,
  motifRejet?: string
) {
  const transfert = await chargerTransfertEntrantCaisse(transfertId);

  if (transfert.statut !== "EN_ATTENTE") {
    throw new Error("Seuls les transferts en attente peuvent être rejetés.");
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

export async function recupererTransfertEntrantCaisse(agentId: string, transfertId: string) {
  const transfert = await chargerTransfertEntrantCaisse(transfertId);

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
