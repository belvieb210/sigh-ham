import "server-only";
import { prisma } from "@/lib/prisma";
import { restaurerVisiteApresRecuperation } from "@/lib/visites/restaurer-visite-recuperation";

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

/** La confirmation se fait uniquement dans la salle d'origine (menu ⋮). */
export async function confirmerTransfertEntrantCaisse(_agentId: string, _transfertId: string) {
  throw new Error(
    "Ce transfert doit être confirmé depuis la salle d'origine via le menu ⋮."
  );
}

export async function rejeterTransfertEntrantCaisse(
  _agentId: string,
  _transfertId: string,
  _motifRejet?: string
) {
  throw new Error(
    "Ce transfert doit être rejeté depuis la salle d'origine via le menu ⋮."
  );
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
    };
  });
}
