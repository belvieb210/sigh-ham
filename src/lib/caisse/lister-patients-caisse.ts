import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type { PatientFileCaisse, StatsCaisseJour } from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function extraireModeFacture(reference: string | null | undefined): string | null {
  if (!reference) return null;
  return (
    reference
      .split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null
  );
}

/**
 * Réintègre en file caisse les patients sortis trop tôt (encaissement avant confirm),
 * tant qu'aucun transfert sortant n'a été confirmé depuis la caisse.
 */
async function reintegrerPatientsCaisseNonConfirmes() {
  const sortis = await prisma.fileAttente.findMany({
    where: {
      salle: { code: "CAISSE" },
      serviLe: { not: null },
    },
    select: {
      id: true,
      passageId: true,
      passage: {
        select: {
          transferts: {
            where: {
              salleOrigine: { code: "CAISSE" },
              statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  const aReouvrir = sortis.filter((f) => f.passage.transferts.length === 0).map((f) => f.id);
  if (aReouvrir.length === 0) return;

  await prisma.fileAttente.updateMany({
    where: { id: { in: aReouvrir } },
    data: { serviLe: null },
  });
}

export async function listerPatientsEnAttenteCaisse(): Promise<PatientFileCaisse[]> {
  await reintegrerPatientsCaisseNonConfirmes();

  const files = await listerPatientsFileAttenteSalle("CAISSE");

  const dossierIds = files.map((f) => f.passage.dossier.id);
  const factures = await prisma.facture.findMany({
    where: {
      dossierId: { in: dossierIds },
      statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
    },
    include: {
      paiements: { orderBy: { payeLe: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const factureParDossier = new Map<
    string,
    {
      statut: StatutFacture;
      montantTotal: number;
      montantPaye: number;
      modeFacture: string | null;
    }
  >();
  for (const f of factures) {
    if (factureParDossier.has(f.dossierId)) continue;
    factureParDossier.set(f.dossierId, {
      statut: f.statut,
      montantTotal: decimalVersNombre(f.montantTotal),
      montantPaye: decimalVersNombre(f.montantPaye),
      modeFacture: extraireModeFacture(f.paiements[0]?.reference),
    });
  }

  return files.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfert = file.passage.transferts[0];
    const examens = dossier.examensLaboratoire;
    const montantEstime = examens.reduce(
      (acc, ex) => acc + decimalVersNombre(ex.typeExamen.prix),
      0
    );
    const medecin =
      dossier.enregistrementsReception[0]?.medecinResponsable?.trim() || null;
    const provenance =
      transfert?.salleOrigine?.nom?.trim() ||
      transfert?.salleOrigine?.code ||
      "—";
    const fac = factureParDossier.get(dossier.id) ?? null;
    const montantFacture = fac?.montantTotal ?? 0;
    const montantPaye = fac?.montantPaye ?? 0;

    return {
      fileAttenteId: file.id,
      passageId: file.passageId,
      transfertId: transfert?.id ?? "",
      dossierId: dossier.id,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone,
      sexe: patient.sexe ?? null,
      dateNaissance: patient.dateNaissance?.toISOString() ?? null,
      motif: transfert?.motif ?? file.passage.motif,
      arriveeLe: file.arriveLe.toISOString(),
      numeroOrdre: file.numeroOrdre,
      nombreExamens: examens.length,
      montantEstime: fac ? Math.max(0, montantFacture - montantPaye) || montantFacture : montantEstime,
      factureOuverte: Boolean(fac),
      statutFacture: fac?.statut ?? null,
      montantFacture,
      montantPaye,
      resteAPayer: fac ? Math.max(0, montantFacture - montantPaye) : montantEstime,
      modeFacture: fac?.modeFacture ?? null,
      provenance,
      medecinResponsable: medecin,
    };
  });
}

export async function obtenirStatsCaisseJour(): Promise<StatsCaisseJour> {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  const [patientsEnAttente, facturesDuJour, paiements] = await Promise.all([
    prisma.fileAttente.count({
      where: {
        salle: { code: "CAISSE" },
        serviLe: null,
      },
    }),
    prisma.facture.count({
      where: {
        createdAt: { gte: debutJour, lte: finJour },
      },
    }),
    prisma.paiement.findMany({
      where: {
        payeLe: { gte: debutJour, lte: finJour },
      },
      select: { montant: true },
    }),
  ]);

  const montantEncaisseDuJour = paiements.reduce(
    (acc, p) => acc + decimalVersNombre(p.montant),
    0
  );

  return {
    patientsEnAttente,
    facturesDuJour,
    encaissementsDuJour: paiements.length,
    montantEncaisseDuJour,
  };
}
