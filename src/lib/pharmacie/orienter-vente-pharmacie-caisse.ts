import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { reserverNumerosTransfert } from "@/lib/reception/numeros";

async function inscrireFileAttentePharmacie(
  tx: Prisma.TransactionClient,
  passageId: string,
  sallePharmacieId: string
) {
  const existante = await tx.fileAttente.findFirst({
    where: {
      passageId,
      salleId: sallePharmacieId,
      serviLe: null,
    },
  });
  if (existante) return existante;

  const ordreMax = await tx.fileAttente.aggregate({
    where: { salleId: sallePharmacieId, serviLe: null },
    _max: { numeroOrdre: true },
  });

  return tx.fileAttente.create({
    data: {
      salleId: sallePharmacieId,
      passageId,
      numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
    },
  });
}

/**
 * Après création de la facture vente : inscrit le client en file pharmacie
 * et crée un transfert PHARMACIE → CAISSE en EN_ATTENTE (confirmation sur /pharmacie/transferts).
 * La caisse ne voit le client qu'après confirmation du transfert.
 */
export async function preparerTransfertVentePharmacieVersCaisse(
  pharmacienId: string,
  dossierId: string,
  tx?: Prisma.TransactionClient
) {
  const run = async (client: Prisma.TransactionClient) => {
    const [sallePharmacie, salleCaisse] = await Promise.all([
      client.salle.findUnique({ where: { code: "PHARMACIE" } }),
      client.salle.findUnique({ where: { code: "CAISSE" } }),
    ]);
    if (!sallePharmacie || !salleCaisse) {
      throw new Error("Salles pharmacie ou caisse introuvables.");
    }

    const filePharmacieExistante = await client.fileAttente.findFirst({
      where: {
        serviLe: null,
        salleId: sallePharmacie.id,
        passage: { dossierId, statut: { not: "ANNULE" } },
      },
      include: { passage: true },
      orderBy: { arriveLe: "desc" },
    });

    let passage = filePharmacieExistante?.passage ?? null;

    if (!passage) {
      passage = await client.passage.findFirst({
        where: { dossierId, statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!passage) {
      passage = await client.passage.create({
        data: {
          dossierId,
          statut: "EN_ATTENTE",
          motif: "Vente pharmacie → encaissement caisse",
        },
      });
    }

    await inscrireFileAttentePharmacie(client, passage.id, sallePharmacie.id);

    const transfertExistant = await client.transfert.findFirst({
      where: {
        dossierId,
        passageId: passage.id,
        salleOrigineId: sallePharmacie.id,
        salleDestinationId: salleCaisse.id,
        statut: { in: ["EN_ATTENTE", "ACCEPTE", "EN_TRAITEMENT"] },
      },
      orderBy: { emisLe: "desc" },
    });

    let transfert = transfertExistant;

    if (transfert?.statut === "EN_ATTENTE") {
      transfert = await client.transfert.update({
        where: { id: transfert.id },
        data: {
          motif: "Facture vente pharmacie → encaissement caisse",
          emetteurId: pharmacienId,
        },
      });
    } else if (!transfert) {
      const [numeroTransfert] = await reserverNumerosTransfert(client, 1);
      transfert = await client.transfert.create({
        data: {
          numeroTransfert,
          dossierId,
          passageId: passage.id,
          salleOrigineId: sallePharmacie.id,
          salleDestinationId: salleCaisse.id,
          emetteurId: pharmacienId,
          statut: "EN_ATTENTE",
          motif: "Facture vente pharmacie → encaissement caisse",
        },
      });
    }

    await client.passage.update({
      where: { id: passage.id },
      data: {
        statut: "EN_ATTENTE",
        motif: "Vente pharmacie — confirmer transfert caisse",
      },
    });

    await client.dossierPatient.update({
      where: { id: dossierId },
      data: { statut: "EN_COURS" },
    });

    return { transfertId: transfert!.id, passageId: passage.id };
  };

  if (tx) return run(tx);
  return prisma.$transaction(run);
}

/** @deprecated Utiliser preparerTransfertVentePharmacieVersCaisse */
export const inscrirePatientVentePharmacieVersCaisse = preparerTransfertVentePharmacieVersCaisse;
