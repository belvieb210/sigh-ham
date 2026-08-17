import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { CHEMINS_STATUT_ANALYSE_LABO, lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cheminSaisieResultats } from "@/lib/laboratoire/saisie-resultats-types";
import type { ActionEnregistrementResultat } from "@/lib/laboratoire/saisie-resultats-types";
import type { StatutExamen } from "@/generated/prisma/client";

type ExamenAvecNotes = {
  statut: StatutExamen | string;
  libelle: string;
  notes?: string | null;
};

function orientationExamen(ex: ExamenAvecNotes): IdOrientationStatutAnalyse | null {
  return lireOrientationAnalyseDepuisNotes(ex.notes);
}

/** Examens visibles sur une page de suivi (filtrage par statut d'examen). */
export function examensPourPageStatut<
  T extends ExamenAvecNotes,
>(examens: T[], pageStatut: IdOrientationStatutAnalyse): T[] {
  switch (pageStatut) {
    case "EN_COURS":
      return examens.filter((e) => e.statut === "EN_ANALYSE");
    case "VERIFIES":
      return examens.filter((e) => {
        if (e.statut !== "TERMINE") return false;
        const o = orientationExamen(e);
        return !o || o === "VERIFIES";
      });
    case "DR_APPROUVE":
      return examens.filter(
        (e) => e.statut === "TERMINE" && orientationExamen(e) === "DR_APPROUVE"
      );
    case "RECUS":
      return examens.filter(
        (e) => e.statut === "PRESCRIT" || e.statut === "PRELEVE"
      );
    case "REJETES":
      return examens.filter((e) => e.statut === "ANNULE");
    default:
      return examens;
  }
}

export function patientCorrespondPageStatut(
  patient: Pick<PatientFileLaboratoire, "examens">,
  pageStatut: IdOrientationStatutAnalyse
) {
  return examensPourPageStatut(patient.examens, pageStatut).length > 0;
}

/** Statut d'analyse UI dérivé du statut Prisma d'un examen. */
export function statutAnalyseDepuisExamen(
  statut: StatutExamen | string,
  notes?: string | null
): IdOrientationStatutAnalyse {
  const marque = lireOrientationAnalyseDepuisNotes(notes);
  if (marque) return marque;

  switch (statut) {
    case "EN_ANALYSE":
      return "EN_COURS";
    case "TERMINE":
      return "VERIFIES";
    case "ANNULE":
      return "REJETES";
    case "PRESCRIT":
    case "PRELEVE":
    default:
      return "RECUS";
  }
}

/** Statuts d'analyse distincts parmi les examens d'un patient. */
export function statutsAnalyseDistincts(
  examens: { statut: StatutExamen | string }[],
  pageStatut?: IdOrientationStatutAnalyse
): IdOrientationStatutAnalyse[] {
  const source = pageStatut
    ? examensPourPageStatut(
        examens.map((e) => ({ statut: e.statut, libelle: "" })),
        pageStatut
      )
    : examens;
  const ids = new Set(
    source.map((e) => statutAnalyseDepuisExamen(e.statut))
  );
  return [...ids];
}

/** Compacte PAT/VIS pour l’affichage (PAT-2026-00002 → PAT202600002). */
function compactNumeroPatOuVis(valeur: string): string {
  if (/^(PAT|VIS)/i.test(valeur)) {
    return valeur.replace(/-/g, "").toUpperCase();
  }
  return valeur;
}

/** N° PAT affiché en colonne « N° Patient » (ex. PAT202600002). */
export function numeroVisiteLaboratoire(p: PatientFileLaboratoire) {
  return numeroEnregistrementLaboratoire(p);
}

/** N° PAT (transfert / orientation). */
export function numeroEnregistrementLaboratoire(p: PatientFileLaboratoire) {
  const brut = p.numeroTransfert?.trim();
  if (!brut) return "—";
  const parties = brut
    .split(",")
    .map((s) => compactNumeroPatOuVis(s.trim()))
    .filter(Boolean);
  const uniques = [...new Set(parties)];
  return uniques[0] ?? "—";
}

/** N° permanent patient (ex. 20260804008). */
export function numeroPermanentPatientLaboratoire(p: PatientFileLaboratoire) {
  return p.numeroPatient || p.numeroEnregistrement || "—";
}

/** @deprecated Alias — n° PAT de l'orientation */
export function codeTransfertLaboratoire(p: PatientFileLaboratoire) {
  return numeroEnregistrementLaboratoire(p);
}

/** Tri décroissant par date d'arrivée (les plus récents en premier). */
export function trierPatientsParArriveeDesc<
  T extends { arriveeLe: string },
>(patients: T[]): T[] {
  return patients.slice().sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

export function libellesExamensDemandes(
  p: PatientFileLaboratoire,
  max = 2,
  pageStatut?: IdOrientationStatutAnalyse
) {
  const source = pageStatut
    ? examensPourPageStatut(p.examens, pageStatut)
    : p.examens;
  const labels = source.map((e) => e.libelle);
  if (labels.length === 0) return "—";
  if (labels.length <= max) return labels.join(", ");
  return `${labels.slice(0, max).join(", ")} +${labels.length - max}`;
}

export function initialesPatient(prenom: string, nom: string) {
  const a = prenom.trim().charAt(0);
  const b = nom.trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "—";
}

const COULEURS_STATUT_ANALYSE: Record<IdOrientationStatutAnalyse, string> = {
  RECUS: "bg-emerald-50 text-emerald-700",
  EN_COURS: "bg-amber-50 text-amber-800",
  VERIFIES: "bg-teal-50 text-teal-800",
  REJETES: "bg-rose-50 text-rose-700",
  DR_APPROUVE: "bg-violet-50 text-violet-800",
};

export function couleurStatutAnalyse(statut: string | null | undefined) {
  const id = (statut || "RECUS") as IdOrientationStatutAnalyse;
  return COULEURS_STATUT_ANALYSE[id] ?? COULEURS_STATUT_ANALYSE.RECUS;
}

export type BadgeStatutLigneLabo = {
  type: "analyse";
  statutAnalyse: IdOrientationStatutAnalyse;
  couleur: string;
};

/** Badge de statut pour les listes labo (statut d'analyse uniquement). */
export function libelleStatutLigneLabo(
  p: PatientFileLaboratoire
): BadgeStatutLigneLabo {
  const statutAnalyse = (p.statutAnalyse ||
    "RECUS") as IdOrientationStatutAnalyse;

  return {
    type: "analyse",
    statutAnalyse,
    couleur: couleurStatutAnalyse(statutAnalyse),
  };
}

type ExamenAvecOrientation = {
  id: string;
  statut: StatutExamen | string;
  libelle: string;
  orientationAnalyse?: IdOrientationStatutAnalyse | null;
};

function examenVersNotes(ex: ExamenAvecOrientation) {
  return ex.orientationAnalyse ? `laboOrientation=${ex.orientationAnalyse}` : null;
}

/** Filtre les examens de saisie selon le statut de la page d'origine. */
export function filtrerExamensSaisieParStatut<T extends ExamenAvecOrientation>(
  examens: T[],
  pageStatut: IdOrientationStatutAnalyse
): T[] {
  return examensPourPageStatut(
    examens.map((e) => ({
      ...e,
      notes: examenVersNotes(e),
    })),
    pageStatut
  );
}

/** URL de saisie contextualisée depuis une liste patient (statut + examen unique). */
export function cheminSaisieResultatsPatient(
  dossierId: string,
  examens: { id: string; statut: StatutExamen | string; libelle: string; notes?: string | null }[],
  pageStatut?: IdOrientationStatutAnalyse
) {
  const examensPage = pageStatut ? examensPourPageStatut(examens, pageStatut) : examens;
  return cheminSaisieResultats(dossierId, {
    statut: pageStatut,
    examenId: examensPage.length === 1 ? examensPage[0]!.id : undefined,
  });
}

export type NavigationApresSauvegardeResultat =
  | { type: "rester-saisie"; examenId: string }
  | { type: "naviguer"; chemin: string };

/**
 * Après enregistrement d'un résultat :
 * - s'il reste des examens sur la page d'origine → y rester (liste ou saisie suivante) ;
 * - sinon → retour à la liste d'origine sans patient sélectionné ;
 * - sans contexte d'origine → page de destination de l'action.
 */
export function determinerNavigationApresSauvegardeResultat(input: {
  statutOrigine: IdOrientationStatutAnalyse | null;
  action: ActionEnregistrementResultat;
  dossierId: string;
  examens: ExamenAvecOrientation[];
  passerSuivant?: boolean;
}): NavigationApresSauvegardeResultat {
  const cheminDestination: Record<ActionEnregistrementResultat, string> = {
    brouillon: CHEMINS_STATUT_ANALYSE_LABO.EN_COURS,
    verifier: CHEMINS_STATUT_ANALYSE_LABO.VERIFIES,
    rejeter: CHEMINS_STATUT_ANALYSE_LABO.REJETES,
    approuver: CHEMINS_STATUT_ANALYSE_LABO.DR_APPROUVE,
  };

  if (input.statutOrigine) {
    const restants = filtrerExamensSaisieParStatut(
      input.examens,
      input.statutOrigine
    );
    const cheminOrigine = CHEMINS_STATUT_ANALYSE_LABO[input.statutOrigine];

    if (input.passerSuivant && restants.length > 0) {
      return { type: "rester-saisie", examenId: restants[0]!.id };
    }

    if (restants.length > 0) {
      return {
        type: "naviguer",
        chemin: `${cheminOrigine}?dossier=${encodeURIComponent(input.dossierId)}`,
      };
    }

    return { type: "naviguer", chemin: cheminOrigine };
  }

  return {
    type: "naviguer",
    chemin: `${cheminDestination[input.action]}?dossier=${encodeURIComponent(input.dossierId)}`,
  };
}
