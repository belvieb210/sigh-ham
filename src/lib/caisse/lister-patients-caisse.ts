import "server-only";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type { PatientFileCaisse, StatsCaisseJour } from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

export async function listerPatientsEnAttenteCaisse(): Promise<PatientFileCaisse[]> {
  const files = await listerPatientsFileAttenteSalle("CAISSE");

  const dossierIds = files.map((f) => f.passage.dossier.id);
  const facturesOuvertes = await prisma.facture.findMany({
    where: {
      dossierId: { in: dossierIds },
      statut: { in: ["BROUILLON", "EMISE", "PARTIELLEMENT_PAYEE"] },
    },
    select: { dossierId: true },
  });
  const dossiersAvecFacture = new Set(facturesOuvertes.map((f) => f.dossierId));

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
      montantEstime,
      factureOuverte: dossiersAvecFacture.has(dossier.id),
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
