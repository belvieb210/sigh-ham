import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { reserverNumerosTransfert } from "@/lib/reception/numeros";

async function inscrireFileAttenteCaisse(
  tx: Prisma.TransactionClient,
  passageId: string,
  salleCaisseId: string
) {
  const existante = await tx.fileAttente.findUnique({ where: { passageId } });
  if (existante) {
    return tx.fileAttente.update({
      where: { passageId },
      data: {
        salleId: salleCaisseId,
        serviLe: null,
        arriveLe: new Date(),
      },
    });
  }

  const ordreMax = await tx.fileAttente.aggregate({
    where: { salleId: salleCaisseId, serviLe: null },
    _max: { numeroOrdre: true },
  });

  return tx.fileAttente.create({
    data: {
      salleId: salleCaisseId,
      passageId,
      numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
    },
  });
}

/**
 * Inscrit le patient à la caisse après transmission d'une vente pharmacie.
 * Fonctionne pour les clients walk-in (sans file pharmacie) et les patients en file.
 * Le transfert pharmacie → caisse est confirmé automatiquement (facture à encaisser).
 */
export async function inscrirePatientVentePharmacieVersCaisse(
  pharmacienId: string,
  dossierId: string
) {
  const [sallePharmacie, salleCaisse] = await Promise.all([
    prisma.salle.findUnique({ where: { code: "PHARMACIE" } }),
    prisma.salle.findUnique({ where: { code: "CAISSE" } }),
  ]);
  if (!sallePharmacie || !salleCaisse) {
    throw new Error("Salles pharmacie ou caisse introuvables.");
  }

  return prisma.$transaction(async (tx) => {
    let passage = await tx.passage.findFirst({
      where: {
        dossierId,
        statut: { not: "ANNULE" },
        fileAttente: {
          is: {
            serviLe: null,
            salle: { code: "PHARMACIE" },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: { fileAttente: true },
    });

    if (!passage) {
      passage = await tx.passage.findFirst({
        where: { dossierId, statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
        include: { fileAttente: true },
      });
    }

    if (!passage) {
      passage = await tx.passage.create({
        data: {
          dossierId,
          statut: "EN_ATTENTE",
          motif: "Vente pharmacie → encaissement caisse",
        },
        include: { fileAttente: true },
      });
    }

    const filePharmacie = await tx.fileAttente.findFirst({
      where: {
        passageId: passage.id,
        salleId: sallePharmacie.id,
        serviLe: null,
      },
    });

    if (filePharmacie) {
      await tx.fileAttente.update({
        where: { id: filePharmacie.id },
        data: { serviLe: new Date() },
      });
    }

    await inscrireFileAttenteCaisse(tx, passage.id, salleCaisse.id);

    let transfert = await tx.transfert.findFirst({
      where: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: sallePharmacie.id,
        salleDestinationId: salleCaisse.id,
        statut: { in: ["EN_ATTENTE", "ACCEPTE", "EN_TRAITEMENT"] },
      },
      orderBy: { emisLe: "desc" },
    });

    if (transfert?.statut === "EN_ATTENTE") {
      transfert = await tx.transfert.update({
        where: { id: transfert.id },
        data: {
          statut: "ACCEPTE",
          recepteurId: pharmacienId,
          accepteLe: new Date(),
        },
      });
    } else if (!transfert) {
      const [numeroTransfert] = await reserverNumerosTransfert(tx, 1);
      transfert = await tx.transfert.create({
        data: {
          numeroTransfert,
          dossierId,
          passageId: passage.id,
          salleOrigineId: sallePharmacie.id,
          salleDestinationId: salleCaisse.id,
          emetteurId: pharmacienId,
          recepteurId: pharmacienId,
          statut: "ACCEPTE",
          accepteLe: new Date(),
          motif: "Facture vente pharmacie → encaissement caisse",
        },
      });
    }

    await tx.passage.update({
      where: { id: passage.id },
      data: {
        statut: "EN_ATTENTE",
        motif: "Encaissement caisse (vente pharmacie)",
      },
    });

    await tx.dossierPatient.update({
      where: { id: dossierId },
      data: { statut: "EN_COURS" },
    });

    return { transfertId: transfert.id, passageId: passage.id };
  });
}
