import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { CODES_ORIENTATION_PHARMACIE } from "@/constants/pharmacie";
import { prisma } from "@/lib/prisma";
import { synchroniserTransfertsEnAttente } from "@/lib/transferts/multi-destinations";

const ORIENTATIONS_AUTORISEES = new Set<string>(CODES_ORIENTATION_PHARMACIE);

function normaliserDestinations(orientations: string[]): CodeSalle[] {
  const codes = [
    ...new Set(
      orientations.map((o) => {
        const code = o.trim() as CodeSalle;
        if (!ORIENTATIONS_AUTORISEES.has(code)) {
          throw new Error("Salle de destination invalide.");
        }
        return code;
      })
    ),
  ];
  if (codes.length === 0) {
    throw new Error("Sélectionnez au moins une destination.");
  }
  if (codes.includes("PHARMACIE")) {
    throw new Error(
      "Le patient est déjà chez les pharmacie. Choisissez une autre destination."
    );
  }
  return codes;
}

/** Synchronise orientations rapides pharmacie (1 ou plusieurs salles). */
export async function reorienterPatientDepuisPharmacie(
  agentId: string,
  dossierId: string,
  orientation: string | string[]
) {
  const codes = normaliserDestinations(
    Array.isArray(orientation) ? orientation : [orientation]
  );

  const salleOrigine = await prisma.salle.findUnique({
    where: { code: "PHARMACIE" },
  });
  if (!salleOrigine) throw new Error("Salle introuvable.");

  const passage = await prisma.passage.findFirst({
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

  if (!passage?.fileAttente) {
    throw new Error("Patient introuvable dans la file d'attente pharmacie.");
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
    motifPrefixe: "Orientation rapide pharmacie",
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
