import "server-only";
import type { Prisma, StatutTransfert } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { assurerFileAttenteDestination } from "@/lib/transferts/multi-destinations";
import { restaurerVisiteApresRecuperation } from "@/lib/visites/restaurer-visite-recuperation";
import { enregistrerOperationGouvernance } from "@/lib/admin/operations-gouvernance";

const STATUTS_ANNULABLES: StatutTransfert[] = [
  "EN_ATTENTE",
  "ACCEPTE",
  "EN_TRAITEMENT",
  "TERMINE",
];

export function transfertAnnulable(statut: StatutTransfert) {
  return STATUTS_ANNULABLES.includes(statut);
}

export function transfertRestaurable(
  statut: StatutTransfert,
  recuperationStatut: string | null
) {
  if (statut === "ANNULE") return true;
  return statut === "REFUSE" && recuperationStatut === "EN_RECUPERATION";
}

const selectTransfert = {
  id: true,
  numeroTransfert: true,
  statut: true,
  motif: true,
  emisLe: true,
  accepteLe: true,
  termineLe: true,
  passageId: true,
  salleOrigine: { select: { id: true, code: true, nom: true } },
  salleDestination: { select: { id: true, code: true, nom: true } },
  recuperation: { select: { id: true, statut: true, examensIds: true } },
} as const;

export async function listerTransfertsPatientAdmin(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      numeroPatient: true,
      prenom: true,
      nom: true,
      photoUrl: true,
      telephone: true,
      dossiers: {
        orderBy: { ouvertLe: "desc" },
        select: {
          id: true,
          numeroDossier: true,
          statut: true,
          ouvertLe: true,
          salleEnregistrement: true,
          transferts: {
            orderBy: { emisLe: "asc" },
            select: selectTransfert,
          },
        },
      },
    },
  });
  if (!patient) return null;

  const visites = patient.dossiers
    .filter((d) => d.transferts.length > 0)
    .map((d) => ({
      dossierId: d.id,
      numeroDossier: d.numeroDossier,
      statut: d.statut,
      ouvertLe: d.ouvertLe.toISOString(),
      salleEnregistrement: d.salleEnregistrement,
      transferts: d.transferts.map((t) => ({
        id: t.id,
        numeroTransfert: t.numeroTransfert,
        statut: t.statut,
        motif: t.motif,
        emisLe: t.emisLe.toISOString(),
        accepteLe: t.accepteLe?.toISOString() ?? null,
        termineLe: t.termineLe?.toISOString() ?? null,
        passageId: t.passageId,
        salleOrigine: t.salleOrigine,
        salleDestination: t.salleDestination,
        recuperationStatut: t.recuperation?.statut ?? null,
        annulable: transfertAnnulable(t.statut),
        restorable: transfertRestaurable(
          t.statut,
          t.recuperation?.statut ?? null
        ),
      })),
    }));

  return {
    patient: {
      id: patient.id,
      numeroPatient: patient.numeroPatient,
      prenom: patient.prenom,
      nom: patient.nom,
      photoUrl: patient.photoUrl,
      telephone: patient.telephone,
    },
    visites,
  };
}

async function retirerFileDestination(
  tx: Prisma.TransactionClient,
  passageId: string | null,
  salleDestinationId: string
) {
  if (!passageId) return;
  const file = await tx.fileAttente.findFirst({
    where: {
      passageId,
      salleId: salleDestinationId,
      serviLe: null,
    },
  });
  if (file) {
    await tx.fileAttente.delete({ where: { id: file.id } });
  }
}

export async function annulerTransfertsPatientAdmin(params: {
  acteurId: string;
  patientId: string;
  dossierId: string;
  transfertIds: string[];
}) {
  if (params.transfertIds.length === 0) {
    throw new Error("Sélectionnez au moins une salle à annuler.");
  }

  const dossier = await prisma.dossierPatient.findFirst({
    where: { id: params.dossierId, patientId: params.patientId },
    select: {
      id: true,
      numeroDossier: true,
      patient: {
        select: { id: true, numeroPatient: true, prenom: true, nom: true },
      },
    },
  });
  if (!dossier) throw new Error("Visite introuvable.");

  const resultat = await prisma.$transaction(async (tx) => {
    const transferts = await tx.transfert.findMany({
      where: {
        id: { in: params.transfertIds },
        dossierId: params.dossierId,
      },
      select: {
        ...selectTransfert,
        salleDestinationId: true,
      },
    });

    if (transferts.length !== params.transfertIds.length) {
      throw new Error("Un ou plusieurs transferts n'appartiennent pas à cette visite.");
    }

    const refuses = transferts.filter((t) => !transfertAnnulable(t.statut));
    if (refuses.length > 0) {
      throw new Error(
        "Certains transferts ne peuvent plus être annulés (déjà annulés ou refusés)."
      );
    }

    const snapshots = [];
    for (const t of transferts) {
      snapshots.push({
        id: t.id,
        statutAvant: t.statut,
        salle: t.salleDestination.nom,
        codeSalle: t.salleDestination.code,
        numeroTransfert: t.numeroTransfert,
      });
      await tx.transfert.update({
        where: { id: t.id },
        data: { statut: "ANNULE", termineLe: new Date() },
      });
      if (t.statut !== "EN_ATTENTE") {
        await retirerFileDestination(tx, t.passageId, t.salleDestinationId);
      }
    }

    await enregistrerOperationGouvernance({
      tx,
      acteurId: params.acteurId,
      type: "ANNULATION_TRANSFERT",
      typeAudit: "TRANSFERT",
      patientId: dossier.patient.id,
      numeroPatient: dossier.patient.numeroPatient,
      dossierId: dossier.id,
      numeroDossier: dossier.numeroDossier,
      action: `Annulation de ${transferts.length} transfert(s) — ${dossier.patient.prenom} ${dossier.patient.nom} / ${dossier.numeroDossier}`,
      snapshot: { transferts: snapshots },
    });

    return { annules: snapshots.length, snapshots };
  });

  return resultat;
}

export async function restaurerTransfertsPatientAdmin(params: {
  acteurId: string;
  patientId: string;
  dossierId: string;
  transfertIds: string[];
}) {
  if (params.transfertIds.length === 0) {
    throw new Error("Sélectionnez au moins un transfert à restaurer.");
  }

  const dossier = await prisma.dossierPatient.findFirst({
    where: { id: params.dossierId, patientId: params.patientId },
    select: {
      id: true,
      numeroDossier: true,
      patient: {
        select: { id: true, numeroPatient: true, prenom: true, nom: true },
      },
    },
  });
  if (!dossier) throw new Error("Visite introuvable.");

  return prisma.$transaction(async (tx) => {
    const transferts = await tx.transfert.findMany({
      where: {
        id: { in: params.transfertIds },
        dossierId: params.dossierId,
      },
      select: {
        ...selectTransfert,
        salleDestinationId: true,
      },
    });

    if (transferts.length !== params.transfertIds.length) {
      throw new Error("Un ou plusieurs transferts n'appartiennent pas à cette visite.");
    }

    const snapshots = [];
    for (const t of transferts) {
      if (!transfertRestaurable(t.statut, t.recuperation?.statut ?? null)) {
        throw new Error(
          `Le transfert vers ${t.salleDestination.nom} ne peut pas être restauré.`
        );
      }

      snapshots.push({
        id: t.id,
        statutAvant: t.statut,
        salle: t.salleDestination.nom,
        codeSalle: t.salleDestination.code,
        numeroTransfert: t.numeroTransfert,
      });

      if (t.statut === "REFUSE" && t.recuperation) {
        await restaurerVisiteApresRecuperation(tx, {
          dossierId: params.dossierId,
          passageId: t.passageId,
          examensIds: t.recuperation.examensIds,
        });
        await tx.transfertRecuperation.update({
          where: { id: t.recuperation.id },
          data: {
            statut: "RECUPERE",
            recupereParId: params.acteurId,
            recupereLe: new Date(),
          },
        });
      }

      await tx.transfert.update({
        where: { id: t.id },
        data: {
          statut: "EN_ATTENTE",
          recepteurId: null,
          accepteLe: null,
          termineLe: null,
        },
      });

      if (t.passageId) {
        await assurerFileAttenteDestination(
          tx,
          t.passageId,
          t.salleDestinationId
        );
      }
    }

    await tx.dossierPatient.update({
      where: { id: params.dossierId },
      data: { statut: "EN_COURS", clotureLe: null },
    });

    await enregistrerOperationGouvernance({
      tx,
      acteurId: params.acteurId,
      type: "RESTAURATION_TRANSFERT",
      typeAudit: "TRANSFERT",
      patientId: dossier.patient.id,
      numeroPatient: dossier.patient.numeroPatient,
      dossierId: dossier.id,
      numeroDossier: dossier.numeroDossier,
      action: `Restauration de ${transferts.length} transfert(s) — ${dossier.patient.prenom} ${dossier.patient.nom} / ${dossier.numeroDossier}`,
      snapshot: { transferts: snapshots },
    });

    return { restaures: snapshots.length, snapshots };
  });
}
