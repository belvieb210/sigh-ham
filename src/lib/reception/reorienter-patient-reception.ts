import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ORIENTATIONS_TRANSFERT_RAPIDE } from "@/lib/reception/transferer-patient-accueil";
import { synchroniserTransfertsEnAttente } from "@/lib/transferts/multi-destinations";

function normaliserDestinations(codes: string[]): CodeSalle[] {
  const uniques = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
  for (const code of uniques) {
    if (!ORIENTATIONS_TRANSFERT_RAPIDE.includes(code as CodeSalle)) {
      throw new Error(`Salle de destination invalide : ${code}.`);
    }
    if (code === "RECEPTION") {
      throw new Error("Choisissez une autre destination que la réception.");
    }
  }
  if (uniques.length === 0) {
    throw new Error("Sélectionnez au moins une destination.");
  }
  return uniques as CodeSalle[];
}

/**
 * Synchronise orientations rapides réception (1 ou plusieurs salles).
 */
export async function reorienterPatientDepuisReception(
  agentId: string,
  dossierId: string,
  codeDestination: string | string[]
) {
  const codes = normaliserDestinations(
    Array.isArray(codeDestination) ? codeDestination : [codeDestination]
  );

  const salleOrigine = await prisma.salle.findUnique({
    where: { code: "RECEPTION" },
  });
  if (!salleOrigine) throw new Error("Salle introuvable.");

  const passage = await prisma.passage.findFirst({
    where: {
      dossierId,
      statut: { not: "ANNULE" },
      OR: [
        {
          fileAttente: {
            is: { serviLe: null, salle: { code: "RECEPTION" } },
          },
        },
        {
          transferts: {
            some: {
              salleOrigineId: salleOrigine.id,
              statut: "EN_ATTENTE",
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { fileAttente: true },
  });

  if (!passage) {
    throw new Error("Patient introuvable pour orientation depuis la réception.");
  }

  const transfertRefuse = await prisma.transfert.findFirst({
    where: {
      dossierId,
      passageId: passage.id,
      salleOrigineId: salleOrigine.id,
      statut: "REFUSE",
      recuperation: { statut: "EN_RECUPERATION" },
    },
  });
  if (transfertRefuse) {
    throw new Error(
      "Ce transfert a été rejeté. Restaurez-le via le menu d'actions avant de changer la destination."
    );
  }

  const salles = await prisma.salle.findMany({ where: { code: { in: codes } } });
  if (salles.length !== codes.length) {
    throw new Error("Salle de destination introuvable.");
  }

  const destinations = codes.map((code) => {
    const s = salles.find((x) => x.code === code)!;
    return { salleId: s.id, code: s.code, nom: s.nom };
  });

  const resultat = await synchroniserTransfertsEnAttente({
    agentId,
    dossierId,
    passageId: passage.id,
    salleOrigineId: salleOrigine.id,
    destinations,
    motifPrefixe: "Orientation rapide réception",
  });

  return {
    transfertId: resultat.transfertIds[0] ?? null,
    transfertIds: resultat.transfertIds,
    salles: resultat.salles,
    salleDestination: resultat.salles.map((s) => s.nom).join(", "),
    codeSalle: resultat.salles[0]?.code ?? codes[0],
    codesSalle: resultat.salles.map((s) => s.code),
    transfertMisAJour: resultat.crees === 0 && resultat.supprimes === 0,
  };
}
