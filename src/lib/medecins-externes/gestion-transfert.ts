import "server-only";
import { prisma } from "@/lib/prisma";

async function chargerTransfertMedecinsExternes(
  transfertId: string,
  medecinExterneId: string
) {
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
  if (transfert.salleOrigine.code !== "MEDECINS_EXTERNES") {
    throw new Error(
      "Ce transfert ne peut être géré que depuis la salle médecins externes."
    );
  }
  if (transfert.dossier.patient.medecinExterneId !== medecinExterneId) {
    throw new Error("Transfert non autorisé pour ce médecin externe.");
  }

  return transfert;
}

export async function confirmerTransfertMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  transfertId: string
) {
  const transfert = await chargerTransfertMedecinsExternes(
    transfertId,
    medecinExterneId
  );

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
  const { inscrirePassagesDansSalles, assurerFileAttenteDestination } = await import(
    "@/lib/transferts/multi-destinations"
  );

  const resultat = await prisma.$transaction(async (tx) => {
    const fileMe = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: "MEDECINS_EXTERNES" },
      },
    });

    if (fileMe) {
      await tx.fileAttente.update({
        where: { id: fileMe.id },
        data: { serviLe: new Date() },
      });
    }

    const transfertEntrant = await tx.transfert.findFirst({
      where: {
        passageId: transfert.passageId!,
        salleDestination: { code: "MEDECINS_EXTERNES" },
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
      await assurerFileAttenteDestination(
        tx,
        inscription.passageId,
        t.salleDestinationId
      );
    }

    const fileMeRestante = await tx.fileAttente.findFirst({
      where: {
        passageId: transfert.passageId!,
        serviLe: null,
        salle: { code: "MEDECINS_EXTERNES" },
      },
    });
    if (fileMeRestante) {
      await tx.fileAttente.update({
        where: { id: fileMeRestante.id },
        data: { serviLe: new Date() },
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
      salleDestination: aConfirmer
        .map((t) => t.salleDestination.nom)
        .join(", "),
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

/**
 * Confirme immédiatement un transfert ME sortant pour inscrire le patient
 * dans la file de la salle destination (visible caisse, labo, etc.).
 */
export async function confirmerOrientationMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  transfertId: string | null | undefined
) {
  if (!transfertId) return null;

  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    select: { statut: true },
  });

  if (!transfert || transfert.statut !== "EN_ATTENTE") {
    return null;
  }

  return confirmerTransfertMedecinsExternes(agentId, medecinExterneId, transfertId);
}

export interface ResultatTransfertMedecinsExternes {
  transfertId?: string | null;
  transfertIds?: string[];
  salleDestination?: string;
  numeroPatient?: string;
  message?: string;
  confirme?: boolean;
}

/** Crée le transfert puis le confirme pour affichage immédiat en destination. */
export async function finaliserTransfertMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  resultat: ResultatTransfertMedecinsExternes
) {
  const transfertId = resultat.transfertIds?.[0] ?? resultat.transfertId ?? null;
  const confirme = await confirmerOrientationMedecinsExternes(
    agentId,
    medecinExterneId,
    transfertId
  );

  if (confirme) {
    return {
      ...resultat,
      ...confirme,
      confirme: true,
      message: `Patient transféré vers ${confirme.salleDestination}.`,
    };
  }

  return {
    ...resultat,
    message:
      resultat.salleDestination != null
        ? `Patient transféré vers ${resultat.salleDestination}.`
        : "Transfert effectué.",
  };
}

export async function rejeterTransfertMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  transfertId: string,
  motifRejet?: string
) {
  const transfert = await chargerTransfertMedecinsExternes(
    transfertId,
    medecinExterneId
  );

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
        motifRejet:
          motifRejet?.trim() || "Transfert rejeté chez les médecins externes",
        rejeteParId: agentId,
      },
      update: {
        statut: "EN_RECUPERATION",
        examensIds: [],
        motifRejet:
          motifRejet?.trim() || "Transfert rejeté chez les médecins externes",
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

export async function restaurerTransfertMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  transfertId: string
) {
  const transfert = await chargerTransfertMedecinsExternes(
    transfertId,
    medecinExterneId
  );

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
