import "server-only";
import type { CodeSalle, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { numeroPatDuParcours } from "@/lib/reception/numeros";

/**
 * Inscrit le patient dans une ou plusieurs salles de destination.
 * 1ère salle : déplace la FileAttente existante du passage.
 * Salles suivantes : nouveau Passage + FileAttente (même dossier).
 */
export async function inscrirePassagesDansSalles(
  tx: Prisma.TransactionClient,
  params: {
    passageOrigineId: string;
    dossierId: string;
    sallesDestinationIds: string[];
    motifBase?: string;
  }
) {
  const uniques = [...new Set(params.sallesDestinationIds)];
  if (uniques.length === 0) {
    throw new Error("Aucune salle de destination.");
  }

  const fileOrigine = await tx.fileAttente.findUnique({
    where: { passageId: params.passageOrigineId },
  });

  const resultats: { passageId: string; salleId: string }[] = [];

  for (let i = 0; i < uniques.length; i++) {
    const salleId = uniques[i]!;

    /** Évite un 2e passage si le dossier est déjà en file dans cette salle. */
    const dejaEnDestination = await tx.fileAttente.findFirst({
      where: {
        serviLe: null,
        salleId,
        passage: { dossierId: params.dossierId },
      },
      orderBy: { arriveLe: "desc" },
    });
    if (dejaEnDestination) {
      resultats.push({ passageId: dejaEnDestination.passageId, salleId });
      continue;
    }

    if (i === 0) {
      if (fileOrigine) {
        await tx.fileAttente.update({
          where: { passageId: params.passageOrigineId },
          data: {
            salleId,
            serviLe: null,
            arriveLe: new Date(),
          },
        });
      } else {
        const ordreMax = await tx.fileAttente.aggregate({
          where: { salleId },
          _max: { numeroOrdre: true },
        });
        await tx.fileAttente.create({
          data: {
            salleId,
            passageId: params.passageOrigineId,
            numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
          },
        });
      }

      await tx.passage.update({
        where: { id: params.passageOrigineId },
        data: {
          statut: "EN_ATTENTE",
          motif: params.motifBase ?? undefined,
        },
      });

      resultats.push({ passageId: params.passageOrigineId, salleId });
      continue;
    }

    const nouveauPassage = await tx.passage.create({
      data: {
        dossierId: params.dossierId,
        statut: "EN_ATTENTE",
        motif: params.motifBase ?? `Transfert multi-destination`,
      },
    });

    const ordreMax = await tx.fileAttente.aggregate({
      where: { salleId },
      _max: { numeroOrdre: true },
    });

    await tx.fileAttente.create({
      data: {
        salleId,
        passageId: nouveauPassage.id,
        numeroOrdre: (ordreMax._max.numeroOrdre ?? 0) + 1,
      },
    });

    resultats.push({ passageId: nouveauPassage.id, salleId });
  }

  return resultats;
}

/** Garantit une file d'attente active dans la salle destination pour ce passage. */
export async function assurerFileAttenteDestination(
  tx: Prisma.TransactionClient,
  passageId: string,
  salleDestinationId: string
) {
  const existante = await tx.fileAttente.findUnique({
    where: { passageId },
  });

  if (existante) {
    if (existante.salleId === salleDestinationId && existante.serviLe === null) {
      return existante;
    }
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
    where: { salleId: salleDestinationId, serviLe: null },
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

/**
 * Synchronise les transferts EN_ATTENTE sortants : crée les manquants, supprime les désélectionnés.
 * Toute l'opération est atomique (une transaction).
 */
export async function synchroniserTransfertsEnAttente(params: {
  agentId: string;
  dossierId: string;
  passageId: string;
  salleOrigineId: string;
  destinations: { salleId: string; code: CodeSalle; nom: string }[];
  motifPrefixe: string;
}) {
  const resultat = await prisma.$transaction(async (tx) => {
    const existants = await tx.transfert.findMany({
      where: {
        dossierId: params.dossierId,
        passageId: params.passageId,
        salleOrigineId: params.salleOrigineId,
        statut: "EN_ATTENTE",
      },
    });

    const idsCibles = new Set(params.destinations.map((d) => d.salleId));
    const aSupprimer = existants.filter((t) => !idsCibles.has(t.salleDestinationId));

    if (aSupprimer.length > 0) {
      await tx.transfert.deleteMany({
        where: { id: { in: aSupprimer.map((t) => t.id) } },
      });
    }

    const restants = existants.filter((t) => idsCibles.has(t.salleDestinationId));
    const parSalle = new Map(restants.map((t) => [t.salleDestinationId, t]));

    const destinationsACreer = params.destinations.filter(
      (d) => !parSalle.has(d.salleId)
    );
    const numeroPat =
      destinationsACreer.length > 0
        ? await numeroPatDuParcours(tx, params.dossierId)
        : null;

    const transfertIds: string[] = [];
    const destinationsCreees: {
      code: CodeSalle;
      nom: string;
      transfertId: string;
    }[] = [];
    let crees = 0;

    for (const dest of params.destinations) {
      const existant = parSalle.get(dest.salleId);
      if (existant) {
        transfertIds.push(existant.id);
        continue;
      }

      const cree = await tx.transfert.create({
        data: {
          numeroTransfert: numeroPat,
          dossierId: params.dossierId,
          passageId: params.passageId,
          salleOrigineId: params.salleOrigineId,
          salleDestinationId: dest.salleId,
          emetteurId: params.agentId,
          statut: "EN_ATTENTE",
          motif: `${params.motifPrefixe} → ${dest.nom}`,
        },
      });

      transfertIds.push(cree.id);
      destinationsCreees.push({
        code: dest.code,
        nom: dest.nom,
        transfertId: cree.id,
      });
      crees += 1;
    }

    if (params.destinations.length > 0) {
      const noms = params.destinations.map((d) => d.nom).join(", ");
      await tx.passage.update({
        where: { id: params.passageId },
        data: {
          statut: "EN_ATTENTE",
          motif: noms ? `Transfert vers ${noms}` : undefined,
        },
      });
    }

    return {
      transfertIds,
      salles: params.destinations.map((d) => ({ code: d.code, nom: d.nom })),
      crees,
      supprimes: aSupprimer.length,
      destinationsCreees,
    };
  });

  return resultat;
}
