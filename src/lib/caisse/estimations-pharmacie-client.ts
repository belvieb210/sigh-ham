import "server-only";
import { prisma } from "@/lib/prisma";
import { estClientWalkInPharmacie, numeroIdentitePersonne } from "@/lib/pharmacie/client-walk-in";

function decimal(v: { toNumber?: () => number } | number | string) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

async function dossiersVisiblesCaisse(dossierIds: string[]) {
  if (dossierIds.length === 0) return new Set<string>();

  const [filesCaisse, transfertsCaisse] = await Promise.all([
    prisma.fileAttente.findMany({
      where: {
        serviLe: null,
        salle: { code: "CAISSE" },
        passage: { dossierId: { in: dossierIds } },
      },
      select: { passage: { select: { dossierId: true } } },
    }),
    prisma.transfert.findMany({
      where: {
        dossierId: { in: dossierIds },
        salleDestination: { code: "CAISSE" },
        statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
      },
      select: { dossierId: true },
    }),
  ]);

  const visibles = new Set<string>();
  for (const f of filesCaisse) visibles.add(f.passage.dossierId);
  for (const t of transfertsCaisse) visibles.add(t.dossierId);
  return visibles;
}

/** Ventes pharmacie transmises — visibles à la caisse uniquement après confirmation du transfert. */
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

  const clients = ventes.filter((v) =>
    estClientWalkInPharmacie(v.dossier.numeroDossier)
  );
  const visibles = await dossiersVisiblesCaisse(clients.map((v) => v.dossierId));

  return clients
    .filter((v) => visibles.has(v.dossierId))
    .map((v) => ({
      id: `vente-ph-${v.id}`,
      dossierId: v.dossierId,
      numeroPatient: numeroIdentitePersonne(
        v.dossier.numeroDossier,
        v.dossier.patient.numeroPatient
      ),
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
