import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cheminSaisieResultats } from "@/lib/laboratoire/saisie-resultats-types";
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

/** N° enregistrement (ex. 20260804008) */
export function numeroEnregistrementLaboratoire(p: PatientFileLaboratoire) {
  return p.numeroEnregistrement || p.numeroDossier;
}

/** N° transfert (ex. PAT-2026-0008) */
export function codeTransfertLaboratoire(p: PatientFileLaboratoire) {
  return p.numeroTransfert || p.numeroPatient;
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

export type BadgeStatutLigneLabo =
  | {
      type: "transfert";
      cle: "aConfirmer" | "rejete";
      couleur: string;
    }
  | {
      type: "analyse";
      statutAnalyse: IdOrientationStatutAnalyse;
      couleur: string;
    };

/**
 * Badge de statut pour les listes labo :
 * priorité au transfert sortant (à confirmer / rejeté),
 * sinon le statut d'analyse orienté (Reçus, Vérifiés…).
 */
export function libelleStatutLigneLabo(
  p: PatientFileLaboratoire
): BadgeStatutLigneLabo {
  if (p.enRecuperation && p.statutTransfertSortant === "REFUSE") {
    return {
      type: "transfert",
      cle: "rejete",
      couleur: "bg-red-100 text-red-700",
    };
  }
  if (p.statutTransfertSortant === "EN_ATTENTE") {
    return {
      type: "transfert",
      cle: "aConfirmer",
      couleur: "bg-orange-100 text-orange-800",
    };
  }

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
