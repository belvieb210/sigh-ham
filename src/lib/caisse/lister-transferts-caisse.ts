import "server-only";
import { COULEURS_ORIENTATION_CAISSE } from "@/constants/caisse";
import {
  listerPatientsEnAttenteCaisse,
} from "@/lib/caisse/lister-patients-caisse";
import type { PatientFileCaisse } from "@/lib/caisse/types";
import { prisma } from "@/lib/prisma";
import type { PatientTransfertCaisse, StatsTransfertsCaisse } from "@/lib/caisse/types";

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function raccourcirOrientation(nom: string): string {
  if (nom.startsWith("Médecin")) return nom.includes("externe") ? "Médecin externe" : "Médecin";
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Église")) return "Église";
  if (nom.startsWith("Caisse")) return "Caisse";
  if (nom.startsWith("Réception") || nom.startsWith("Reception")) return "Réception";
  return nom;
}

function patientEstPayePourTransfertSortant(p: PatientFileCaisse): boolean {
  return p.facturationComplete;
}

function libelleStatutEntrant(opts: {
  statutFacture?: string | null;
  factureOuverte: boolean;
  statutTransfertEntrant: string | null;
  enRecuperation: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfertEntrant === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (opts.statutTransfertEntrant === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  if (opts.statutFacture === "PAYEE") {
    return { statut: "Payée", statutCouleur: "bg-emerald-100 text-emerald-700" };
  }
  if (opts.statutFacture === "PARTIELLEMENT_PAYEE") {
    return { statut: "Avance", statutCouleur: "bg-amber-100 text-amber-800" };
  }
  if (opts.factureOuverte && opts.statutFacture === "EMISE") {
    return { statut: "Facturé", statutCouleur: "bg-blue-100 text-blue-700" };
  }
  return { statut: "À facturer", statutCouleur: "bg-amber-100 text-amber-800" };
}

function libelleStatutPayeSortant(opts: {
  factureOuverte: boolean;
  statutFacture?: string | null;
  statutTransfert: string | null;
  enRecuperation: boolean;
  facturationComplete?: boolean;
  aUneFacturePayee?: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfert === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (
    opts.statutFacture === "PAYEE" ||
    opts.facturationComplete ||
    opts.aUneFacturePayee
  ) {
    return { statut: "Payée", statutCouleur: "bg-emerald-100 text-emerald-700" };
  }
  if (opts.statutTransfert === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  if (opts.statutFacture === "PARTIELLEMENT_PAYEE") {
    return { statut: "Avance", statutCouleur: "bg-amber-100 text-amber-800" };
  }
  return { statut: "Prêt", statutCouleur: "bg-emerald-100 text-emerald-700" };
}

type TransfertSortant = {
  id: string;
  dossierId: string;
  statut: string;
  salleDestination: { code: string; nom: string };
  recuperation: { statut: string } | null;
};

function mapperPatientTransfert(
  p: PatientFileCaisse,
  sortantsParDossier: Map<string, TransfertSortant[]>,
  section: PatientTransfertCaisse["section"],
  statutTransfertEntrantOverride?: string | null
): PatientTransfertCaisse {
  const sortants = sortantsParDossier.get(p.dossierId) ?? [];
  const sortant = sortants[0];
  const enRecuperationEntrant =
    statutTransfertEntrantOverride === "REFUSE" ||
    sortants.some((s) => s.recuperation?.statut === "EN_RECUPERATION");
  const enRecuperationSortant = sortants.some(
    (s) => s.recuperation?.statut === "EN_RECUPERATION"
  );
  const statutTransfertEntrant = statutTransfertEntrantOverride ?? null;

  const orientation =
    section === "entrant"
      ? "Caisse"
      : sortants.length
        ? sortants.map((s) => raccourcirOrientation(s.salleDestination.nom)).join(", ")
        : "Caisse";

  const { statut, statutCouleur } =
    section === "entrant"
      ? libelleStatutEntrant({
          factureOuverte: p.factureOuverte,
          statutFacture: p.statutFacture,
          statutTransfertEntrant,
          enRecuperation: enRecuperationEntrant,
        })
      : libelleStatutPayeSortant({
          factureOuverte: p.factureOuverte,
          statutFacture: p.statutFacture,
          statutTransfert: sortant?.statut ?? null,
          enRecuperation: enRecuperationSortant,
          facturationComplete: p.facturationComplete,
          aUneFacturePayee: p.aUneFacturePayee,
        });

  return {
    cleListe: `${section}-${p.fileAttenteId}`,
    section,
    dossierId: p.dossierId,
    numeroPatient: p.numeroPatient,
    numeroDossier: p.numeroDossier,
    nomComplet: `${p.prenom} ${p.nom}`,
    prenom: p.prenom,
    nom: p.nom,
    telephone: p.telephone ?? "—",
    motif: p.motif ?? "—",
    orientation,
    orientationCouleur:
      section === "entrant"
        ? (COULEURS_ORIENTATION_CAISSE.Caisse ?? "bg-slate-100 text-slate-600")
        : (COULEURS_ORIENTATION_CAISSE[
            sortant ? raccourcirOrientation(sortant.salleDestination.nom) : "Caisse"
          ] ?? "bg-slate-100 text-slate-600"),
    codeSalleDestination: sortant?.salleDestination.code ?? "CAISSE",
    codesSalleDestination: sortants.map((s) => s.salleDestination.code),
    statut,
    statutCouleur,
    heure: formaterHeure(p.arriveeLe),
    arriveeLe: p.arriveeLe,
    transfertId: p.transfertId || null,
    statutTransfertEntrant,
    transfertSortantId: section === "paye" ? (sortant?.id ?? null) : null,
    statutTransfertSortant: section === "paye" ? (sortant?.statut ?? null) : null,
    enRecuperation: section === "entrant" ? enRecuperationEntrant : enRecuperationSortant,
    passageId: p.passageId,
    numeroOrdre: p.numeroOrdre,
    nombreExamens: p.nombreExamens,
    montantEstime: p.montantEstime,
    dateNaissance: p.dateNaissance,
    factureOuverte: p.factureOuverte,
    facturationComplete: p.facturationComplete,
    provenance: p.provenance,
    medecinResponsable: p.medecinResponsable,
    estClientWalkIn: p.estClientWalkIn,
    nombreMedicaments: p.nombreMedicaments,
    peutOrienterSortant: section === "paye" && patientEstPayePourTransfertSortant(p),
  };
}

async function chargerSortantsParDossier(
  dossierIds: string[]
): Promise<Map<string, TransfertSortant[]>> {
  if (dossierIds.length === 0) return new Map();

  const transfertsSortants = await prisma.transfert.findMany({
    where: {
      dossierId: { in: dossierIds },
      salleOrigine: { code: "CAISSE" },
      OR: [
        { statut: "EN_ATTENTE" },
        {
          statut: "REFUSE",
          recuperation: { statut: "EN_RECUPERATION" },
        },
      ],
    },
    include: {
      salleDestination: { select: { code: true, nom: true } },
      recuperation: { select: { statut: true } },
    },
    orderBy: { emisLe: "desc" },
  });

  const sortantsParDossier = new Map<string, TransfertSortant[]>();
  for (const t of transfertsSortants) {
    const liste = sortantsParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantsParDossier.set(t.dossierId, liste);
  }
  return sortantsParDossier;
}

async function chargerDossiersAvecSortantConfirme(dossierIds: string[]): Promise<Set<string>> {
  if (dossierIds.length === 0) return new Set();

  const confirmes = await prisma.transfert.findMany({
    where: {
      dossierId: { in: dossierIds },
      salleOrigine: { code: "CAISSE" },
      statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
    },
    select: { dossierId: true },
  });

  return new Set(confirmes.map((t) => t.dossierId));
}

export async function listerPatientsTransfertsCaisse(): Promise<{
  patientsEntrants: PatientTransfertCaisse[];
  patientsFacturesPayes: PatientTransfertCaisse[];
  stats: StatsTransfertsCaisse;
}> {
  const [fileCaisse, transferesDepuisCaisse] = await Promise.all([
    listerPatientsEnAttenteCaisse({ pourPageTransferts: true }),
    (async () => {
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      return prisma.transfert.count({
        where: {
          salleOrigine: { code: "CAISSE" },
          emisLe: { gte: debut },
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
        },
      });
    })(),
  ]);

  const entrantsSource = fileCaisse.filter((p) => !patientEstPayePourTransfertSortant(p));
  const payesSourceBrut = fileCaisse.filter((p) => patientEstPayePourTransfertSortant(p));
  const dossierIdsPayes = payesSourceBrut.map((p) => p.dossierId);

  const [sortantsParDossier, dossiersSortis] = await Promise.all([
    chargerSortantsParDossier(dossierIdsPayes),
    chargerDossiersAvecSortantConfirme(dossierIdsPayes),
  ]);

  const payesSource = payesSourceBrut.filter((p) => !dossiersSortis.has(p.dossierId));

  const patientsEntrants = entrantsSource.map((p) =>
    mapperPatientTransfert(p, sortantsParDossier, "entrant")
  );

  const patientsFacturesPayes = payesSource.map((p) =>
    mapperPatientTransfert(p, sortantsParDossier, "paye")
  );

  const stats: StatsTransfertsCaisse = {
    enAttente: patientsEntrants.length,
    enCours: patientsFacturesPayes.filter(
      (p) =>
        p.statutTransfertSortant === "EN_ATTENTE" || p.statut === "À confirmer"
    ).length,
    transferesAujourdhui: transferesDepuisCaisse,
    versLaboratoire: patientsFacturesPayes.filter((p) => p.orientation === "Laboratoire")
      .length,
  };

  return { patientsEntrants, patientsFacturesPayes, stats };
}
