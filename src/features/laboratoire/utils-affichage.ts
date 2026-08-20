import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { CHEMINS_STATUT_ANALYSE_LABO, lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cheminSaisieResultats } from "@/lib/laboratoire/saisie-resultats-types";
import type { ActionEnregistrementResultat } from "@/lib/laboratoire/saisie-resultats-types";
import type { StatutExamen } from "@/generated/prisma/client";
import {
  afficherNumeroVisite,
  compactNumeroPatOuVis,
} from "@/lib/numeros/affichage";

type ExamenAvecNotes = {
  statut: StatutExamen | string;
  libelle: string;
  notes?: string | null;
};

function orientationExamen(ex: ExamenAvecNotes): IdOrientationStatutAnalyse | null {
  return lireOrientationAnalyseDepuisNotes(ex.notes);
}

/** Clé d’une ligne tableau (un dossier, ou un dossier + une facture). */
export function cleLignePatientLabo(p: Pick<PatientFileLaboratoire, "dossierId" | "cleListe">) {
  return p.cleListe || p.dossierId;
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

/** N° VIS du parcours (ex. VIS2026000001) — jamais le n° permanent. */
export function numeroDossierVisiteLaboratoire(p: PatientFileLaboratoire) {
  return afficherNumeroVisite(p.numeroDossier);
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

/** N° permanent patient (ex. 20260804008) — jamais le n° de visite. */
export function numeroPermanentPatientLaboratoire(p: PatientFileLaboratoire) {
  const permanent = p.numeroPatient?.trim();
  if (permanent) return permanent;
  const fallback = p.numeroEnregistrement?.trim();
  if (fallback && fallback !== p.numeroDossier?.trim()) return fallback;
  return "—";
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
  | {
      type: "rester-saisie";
      examenId: string;
      /** Filtre d'affichage à garder / basculer (ex. En cours → Vérifiés). */
      statutSaisie?: IdOrientationStatutAnalyse;
    }
  | { type: "naviguer"; chemin: string };

function examenSaisieSuivant(
  restants: ExamenAvecOrientation[],
  examenCourantId?: string | null
): string {
  if (!examenCourantId) return restants[0]!.id;
  const encorePresent = restants.find((e) => e.id === examenCourantId);
  if (encorePresent && restants.length === 1) return encorePresent.id;
  const idxCourant = restants.findIndex((e) => e.id === examenCourantId);
  if (idxCourant >= 0) {
    return restants[(idxCourant + 1) % restants.length]!.id;
  }
  return restants[0]!.id;
}

const STATUT_APRES_ACTION: Record<
  ActionEnregistrementResultat,
  IdOrientationStatutAnalyse
> = {
  brouillon: "EN_COURS",
  verifier: "VERIFIES",
  rejeter: "REJETES",
  approuver: "DR_APPROUVE",
  restaurer: "VERIFIES",
  supprimer: "REJETES",
};

function resterSurExamen(
  restants: ExamenAvecOrientation[],
  input: {
    passerSuivant?: boolean;
    examenCourantId?: string | null;
  },
  statutSaisie: IdOrientationStatutAnalyse
): NavigationApresSauvegardeResultat {
  const garderCourant =
    !input.passerSuivant &&
    Boolean(
      input.examenCourantId &&
        restants.some((e) => e.id === input.examenCourantId)
    );
  return {
    type: "rester-saisie",
    statutSaisie,
    examenId: garderCourant
      ? input.examenCourantId!
      : examenSaisieSuivant(restants, input.examenCourantId),
  };
}

/**
 * Après enregistrement d'un résultat, on reste sur la même visite/facture :
 * - s'il reste des examens du filtre d'origine (ex. autres Vérifiés à approuver) ;
 * - après Valider : rester en Vérifiés sur cet examen, même si les autres de
 *   la facture sont déjà Dr approuvé (ils ne doivent pas le faire disparaître) ;
 * - après le dernier Approuver / Rejeter de cette visite : retour à la liste
 *   d'origine (Vérifiés), pour continuer les autres patients et les autres
 *   visites/factures — sans envoyer vers Dr approuvé.
 */
export function determinerNavigationApresSauvegardeResultat(input: {
  statutOrigine: IdOrientationStatutAnalyse | null;
  action: ActionEnregistrementResultat;
  dossierId: string;
  examens: ExamenAvecOrientation[];
  passerSuivant?: boolean;
  examenCourantId?: string | null;
}): NavigationApresSauvegardeResultat {
  const cheminDestination: Record<ActionEnregistrementResultat, string> = {
    brouillon: CHEMINS_STATUT_ANALYSE_LABO.EN_COURS,
    verifier: CHEMINS_STATUT_ANALYSE_LABO.VERIFIES,
    rejeter: CHEMINS_STATUT_ANALYSE_LABO.REJETES,
    approuver: CHEMINS_STATUT_ANALYSE_LABO.DR_APPROUVE,
    restaurer: CHEMINS_STATUT_ANALYSE_LABO.VERIFIES,
    supprimer: CHEMINS_STATUT_ANALYSE_LABO.REJETES,
  };

  if (input.action === "restaurer") {
    const restantsRejetes = filtrerExamensSaisieParStatut(input.examens, "REJETES");
    if (restantsRejetes.length > 0) {
      return resterSurExamen(restantsRejetes, input, "REJETES");
    }
    return {
      type: "naviguer",
      chemin: `${CHEMINS_STATUT_ANALYSE_LABO.VERIFIES}?dossier=${encodeURIComponent(input.dossierId)}`,
    };
  }

  if (input.action === "supprimer") {
    const restantsRejetes = filtrerExamensSaisieParStatut(input.examens, "REJETES");
    if (restantsRejetes.length > 0) {
      return resterSurExamen(restantsRejetes, input, "REJETES");
    }
    return {
      type: "naviguer",
      chemin: `${CHEMINS_STATUT_ANALYSE_LABO.REJETES}?dossier=${encodeURIComponent(input.dossierId)}`,
    };
  }

  if (input.statutOrigine) {
    const restantsOrigine = filtrerExamensSaisieParStatut(
      input.examens,
      input.statutOrigine
    );
    if (restantsOrigine.length > 0) {
      return resterSurExamen(restantsOrigine, input, input.statutOrigine);
    }
  }

  const statutArrivee = STATUT_APRES_ACTION[input.action];
  const restantsArrivee = filtrerExamensSaisieParStatut(
    input.examens,
    statutArrivee
  );

  if (input.action === "verifier" && restantsArrivee.length > 0) {
    const examenId =
      input.examenCourantId &&
      restantsArrivee.some((e) => e.id === input.examenCourantId)
        ? input.examenCourantId
        : restantsArrivee[0]!.id;
    return {
      type: "rester-saisie",
      examenId,
      statutSaisie: "VERIFIES",
    };
  }

  if (input.action === "brouillon" && restantsArrivee.length > 0) {
    return resterSurExamen(restantsArrivee, input, "EN_COURS");
  }

  if (input.statutOrigine) {
    return {
      type: "naviguer",
      chemin: CHEMINS_STATUT_ANALYSE_LABO[input.statutOrigine],
    };
  }

  return {
    type: "naviguer",
    chemin: `${cheminDestination[input.action]}?dossier=${encodeURIComponent(input.dossierId)}`,
  };
}
