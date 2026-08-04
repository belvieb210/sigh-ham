import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { CODES_ORIENTATION_EGLISE } from "@/constants/eglise";
import { prisma } from "@/lib/prisma";
import { synchroniserTransfertsEnAttente } from "@/lib/transferts/multi-destinations";

const ORIENTATIONS_AUTORISEES = new Set<string>(CODES_ORIENTATION_EGLISE);

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
  if (codes.includes("EGLISE")) {
    throw new Error(
      "Le patient est déjà au service Église. Choisissez une autre destination."
    );
  }
  return codes;
}

export async function reorienterPatientDepuisEglise(
  agentId: string,
  dossierId: string,
  orientation: string | string[]
) {
  const codes = normaliserDestinations(
    Array.isArray(orientation) ? orientation : [orientation]
  );

  const salleOrigine = await prisma.salle.findUnique({
    where: { code: "EGLISE" },
  });
  if (!salleOrigine) throw new Error("Salle introuvable.");

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      passages: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  let passageId = dossier.passages[0]?.id;
  if (!passageId) {
    const passage = await prisma.passage.create({
      data: {
        dossierId,
        statut: "EN_ATTENTE",
        motif: "Orientation depuis le service Église",
      },
    });
    passageId = passage.id;
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
    passageId,
    salleOrigineId: salleOrigine.id,
    destinations,
    motifPrefixe: "Orientation service Église",
  });

  return {
    ...resultat,
    salleDestination: codes.join(", "),
  };
}
