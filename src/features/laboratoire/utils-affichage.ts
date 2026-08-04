import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

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
  max = 5
) {
  const labels = p.examens.map((e) => e.libelle);
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
