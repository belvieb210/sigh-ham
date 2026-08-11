import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ORIENTATIONS_RAPIDES_CAISSE } from "@/constants/caisse";
import { dossierEstFacturePayeePourTransfert } from "@/lib/caisse/facturation-transfert";
import { confirmerTransfertCaisse } from "@/lib/caisse/gestion-transfert-caisse";
import { synchroniserTransfertsEnAttente } from "@/lib/transferts/multi-destinations";

export const ORIENTATIONS_CAISSE_AUTORISEES: CodeSalle[] = ORIENTATIONS_RAPIDES_CAISSE.map(
  (o) => o.value as CodeSalle
);

function normaliserDestinations(codes: string[]): CodeSalle[] {
  const uniques = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
  for (const code of uniques) {
    if (!ORIENTATIONS_CAISSE_AUTORISEES.includes(code as CodeSalle)) {
      throw new Error(`Salle de destination invalide : ${code}.`);
    }
    if (code === "CAISSE") {
      throw new Error("Le patient est déjà à la caisse. Choisissez une autre destination.");
    }
  }
  if (uniques.length === 0) {
    throw new Error("Sélectionnez au moins une destination.");
  }
  return uniques as CodeSalle[];
}

/**
 * Synchronise les orientations rapides caisse (1 ou plusieurs salles).
 * Le patient reste en file caisse jusqu'à confirmation.
 */
export async function reorienterPatientDepuisCaisse(
  caissierId: string,
  dossierId: string,
  codeDestination: string | string[]
) {
  const codes = normaliserDestinations(
    Array.isArray(codeDestination) ? codeDestination : [codeDestination]
  );

  const salleOrigine = await prisma.salle.findUnique({ where: { code: "CAISSE" } });
  if (!salleOrigine) throw new Error("Salle introuvable.");

  const passage = await prisma.passage.findFirst({
    where: {
      dossierId,
      statut: { not: "ANNULE" },
      fileAttente: {
        is: {
          serviLe: null,
          salle: { code: "CAISSE" },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: { fileAttente: true },
  });

  if (!passage?.fileAttente) {
    throw new Error("Patient introuvable dans la file d'attente caisse.");
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

  const salles = await prisma.salle.findMany({
    where: { code: { in: codes } },
  });
  if (salles.length !== codes.length) {
    throw new Error("Salle de destination introuvable.");
  }

  const destinations = codes.map((code) => {
    const s = salles.find((x) => x.code === code)!;
    return { salleId: s.id, code: s.code, nom: s.nom };
  });

  const resultat = await synchroniserTransfertsEnAttente({
    agentId: caissierId,
    dossierId,
    passageId: passage.id,
    salleOrigineId: salleOrigine.id,
    destinations,
    motifPrefixe: "Orientation rapide caisse",
  });

  let transfertConfirme = false;
  const premierTransfertId = resultat.transfertIds[0] ?? null;

  // Facture payée : confirmer automatiquement pour rendre le patient visible en labo / pharmacie, etc.
  if (premierTransfertId) {
    const facturePayee = await dossierEstFacturePayeePourTransfert(dossierId);
    if (facturePayee) {
      try {
        await confirmerTransfertCaisse(caissierId, premierTransfertId);
        transfertConfirme = true;
      } catch (error) {
        console.error("[reorienterPatientDepuisCaisse] auto-confirmation", error);
      }
    }
  }

  return {
    transfertId: premierTransfertId,
    transfertIds: resultat.transfertIds,
    salles: resultat.salles,
    salleDestination: resultat.salles.map((s) => s.nom).join(", "),
    codeSalle: resultat.salles[0]?.code ?? codes[0],
    codesSalle: resultat.salles.map((s) => s.code),
    transfertMisAJour: resultat.crees === 0 && resultat.supprimes === 0,
    transfertConfirme,
  };
}
