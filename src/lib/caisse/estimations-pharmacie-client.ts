import "server-only";
import { prisma } from "@/lib/prisma";
import { estClientWalkInPharmacie } from "@/lib/pharmacie/client-walk-in";

function decimal(v: { toNumber?: () => number } | number | string) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

/** Ventes pharmacie transmises à la caisse (clients walk-in) — affichées comme estimations. */
export async function listerEstimationsPharmacieClientPourCaisse() {
  const ventes = await prisma.ventePharmacie.findMany({
    where: {
      statut: "TRANSMISE",
      facture: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE"] } },
    },
    include: {
      dossier: { include: { patient: true } },
      facture: { select: { numeroFacture: true, statut: true, montantTotal: true } },
      pharmacien: { select: { prenom: true, nom: true } },
      lignes: { include: { medicament: true } },
    },
    orderBy: { transmiseLe: "desc" },
    take: 80,
  });

  return ventes
    .filter((v) => estClientWalkInPharmacie(v.dossier.numeroDossier))
    .map((v) => ({
      id: `vente-ph-${v.id}`,
      dossierId: v.dossierId,
      numeroPatient: v.dossier.patient.numeroPatient,
      numeroDossier: v.dossier.numeroDossier,
      nomComplet: `${v.dossier.patient.prenom} ${v.dossier.patient.nom}`.trim(),
      typeEstimation: "PHARMACIE_CLIENT" as const,
      libelleSource: "Vente pharmacie (client)",
      nomConvention: null,
      totalPatientUsd: 0,
      montantCdf: decimal(v.montantTotal),
      honoraireUsd: 0,
      honorairePct: 0,
      emetteurNom: `${v.pharmacien.prenom} ${v.pharmacien.nom}`.trim(),
      emisLe: (v.transmiseLe ?? v.creeLe).toISOString(),
      envoyeCaisseLe: v.transmiseLe?.toISOString() ?? null,
      traiteLe: null,
      traiteParNom: null,
      statut: "ENVOYEE_CAISSE",
      numeroFacture: v.facture?.numeroFacture ?? null,
      nbMedicaments: v.lignes.length,
      estClientWalkIn: true,
    }));
}
