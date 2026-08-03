import "server-only";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import { calculerAge } from "@/features/caisse/utils-format";
import type {
  DetailPatientLaboratoire,
  PatientFileLaboratoire,
  StatsLaboratoireJour,
} from "@/lib/laboratoire/types";

function extraireModeFacture(reference: string | null | undefined): string | null {
  if (!reference) return null;
  return (
    reference
      .split("|")
      .find((part) => part.startsWith("modeFacture="))
      ?.replace("modeFacture=", "") ?? null
  );
}

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function listerPatientsLaboratoire(): Promise<PatientFileLaboratoire[]> {
  const files = await listerPatientsFileAttenteSalle("LABORATOIRE");
  const dossierIds = files.map((f) => f.passage.dossier.id);

  const factures = await prisma.facture.findMany({
    where: {
      dossierId: { in: dossierIds },
      statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "PAYEE"] },
    },
    include: {
      paiements: { orderBy: { payeLe: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const factureParDossier = new Map<
    string,
    { numeroFacture: string; statut: string; modePaiement: string | null }
  >();
  for (const f of factures) {
    if (factureParDossier.has(f.dossierId)) continue;
    factureParDossier.set(f.dossierId, {
      numeroFacture: f.numeroFacture,
      statut: f.statut,
      modePaiement: extraireModeFacture(f.paiements[0]?.reference),
    });
  }

  return files.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfert = file.passage.transferts[0];
    const examens = dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      statut: ex.statut,
      code: ex.typeExamen.code,
    }));
    const fac = factureParDossier.get(dossier.id) ?? null;

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
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      arriveeLe: file.arriveLe.toISOString(),
      numeroOrdre: file.numeroOrdre,
      provenance:
        transfert?.salleOrigine?.nom?.trim() ||
        transfert?.salleOrigine?.code ||
        "—",
      medecinResponsable:
        dossier.enregistrementsReception[0]?.medecinResponsable?.trim() || null,
      examens,
      nombreExamens: examens.length,
      numeroFacture: fac?.numeroFacture ?? null,
      modePaiement: fac?.modePaiement ?? null,
      statutFacture: fac?.statut ?? null,
    };
  });
}

export async function obtenirDetailPatientLaboratoire(
  dossierId: string
): Promise<DetailPatientLaboratoire | null> {
  const patients = await listerPatientsLaboratoire();
  const base = patients.find((p) => p.dossierId === dossierId);
  if (!base) return null;

  const patient = await prisma.patient.findFirst({
    where: { dossiers: { some: { id: dossierId } } },
    select: { photoUrl: true },
  });

  return {
    ...base,
    photoUrl: patient?.photoUrl ?? null,
  };
}

export async function obtenirStatsLaboratoire(): Promise<StatsLaboratoireJour> {
  const patients = await listerPatientsLaboratoire();
  const debut = debutJourLocal();

  const patientsRecusAujourdhui = patients.filter(
    (p) => new Date(p.arriveeLe) >= debut
  ).length;

  const examensEnCours = patients.reduce(
    (acc, p) =>
      acc +
      p.examens.filter((e) => e.statut === "EN_ANALYSE" || e.statut === "PRESCRIT")
        .length,
    0
  );

  const debutIso = debut.toISOString();
  const [resultatsAValider, resultatsValidesAujourdhui] = await Promise.all([
    // Tranche 1 : pas encore de workflow validation — compteur 0
    Promise.resolve(0),
    prisma.examenLaboratoire.count({
      where: {
        statut: "TERMINE",
        resultatLe: { gte: new Date(debutIso) },
      },
    }),
  ]);

  return {
    dateReference: new Date().toISOString(),
    patientsRecusAujourdhui,
    patientsEnFile: patients.length,
    examensEnCours,
    resultatsAValider,
    resultatsValidesAujourdhui,
    derniersArrives: [...patients]
      .sort(
        (a, b) =>
          new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
      )
      .slice(0, 8),
  };
}

/** Passe les examens PRESCRIT du dossier en EN_ANALYSE (démarrage analyses). */
export async function commencerAnalysesDossier(
  dossierId: string,
  technicienId: string
): Promise<{ misAJour: number }> {
  const enFile = await prisma.fileAttente.findFirst({
    where: {
      serviLe: null,
      salle: { code: "LABORATOIRE" },
      passage: { dossierId },
    },
    select: { id: true },
  });
  if (!enFile) {
    throw new Error("Patient introuvable dans la file laboratoire.");
  }

  const result = await prisma.examenLaboratoire.updateMany({
    where: {
      dossierId,
      statut: "PRESCRIT",
    },
    data: {
      statut: "EN_ANALYSE",
      technicienId,
    },
  });

  return { misAJour: result.count };
}
