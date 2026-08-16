import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { filtrerOrientationsAutorisees } from "@/lib/transferts/orientations-universelles";
import { prisma } from "@/lib/prisma";
import { synchroniserTransfertsEnAttente } from "@/lib/transferts/multi-destinations";
import { assertDossierDuMedecinExterne } from "@/lib/medecins-externes/assurer-fiche";

const ORIGINE: CodeSalle = "MEDECINS_EXTERNES";

function normaliserDestinations(orientations: string[]): CodeSalle[] {
  const codes = filtrerOrientationsAutorisees(ORIGINE, orientations);
  if (codes.length === 0) {
    throw new Error("Sélectionnez au moins une destination.");
  }
  if (codes.includes("MEDECINS_EXTERNES")) {
    throw new Error(
      "Le patient est déjà chez les médecins externes. Choisissez une autre destination."
    );
  }
  return codes;
}

async function trouverPassagePourOrientationMedecinsExternes(
  dossierId: string,
  salleOrigineId: string
) {
  const include = { fileAttente: { include: { salle: true } } } as const;

  const avecTransfertEnAttente = await prisma.passage.findFirst({
    where: {
      dossierId,
      statut: { not: "ANNULE" },
      transferts: {
        some: {
          salleOrigineId,
          statut: "EN_ATTENTE",
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include,
  });
  if (avecTransfertEnAttente) return avecTransfertEnAttente;

  const enFileMe = await prisma.passage.findFirst({
    where: {
      dossierId,
      statut: { not: "ANNULE" },
      fileAttente: {
        is: { serviLe: null, salle: { code: "MEDECINS_EXTERNES" } },
      },
    },
    orderBy: { createdAt: "desc" },
    include,
  });
  if (enFileMe) return enFileMe;

  return prisma.passage.findFirst({
    where: {
      dossierId,
      statut: { not: "ANNULE" },
    },
    orderBy: { createdAt: "desc" },
    include,
  });
}

export async function reorienterPatientDepuisMedecinsExternes(
  agentId: string,
  medecinExterneId: string,
  dossierId: string,
  orientation: string | string[]
) {
  await assertDossierDuMedecinExterne(dossierId, medecinExterneId);

  const codes = normaliserDestinations(
    Array.isArray(orientation) ? orientation : [orientation]
  );

  const salleOrigine = await prisma.salle.findUnique({
    where: { code: "MEDECINS_EXTERNES" },
  });
  if (!salleOrigine) throw new Error("Salle introuvable.");

  const passage = await trouverPassagePourOrientationMedecinsExternes(
    dossierId,
    salleOrigine.id
  );

  if (!passage) {
    throw new Error(
      "Patient introuvable pour orientation depuis les médecins externes."
    );
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
    motifPrefixe: "Orientation rapide médecin externe",
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
