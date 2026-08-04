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

export function statutFileLabo(p: PatientFileLaboratoire): "EN_COURS" | "RECU" {
  if (p.examens.some((e) => e.statut === "EN_ANALYSE")) return "EN_COURS";
  return "RECU";
}

/** Statut affiché dans la file patients (transferts sortants inclus). */
export function libelleStatutLigneLabo(p: PatientFileLaboratoire): {
  cle: "aConfirmer" | "rejete" | "enCours" | "recu";
  couleur: string;
} {
  if (p.enRecuperation && p.statutTransfertSortant === "REFUSE") {
    return { cle: "rejete", couleur: "bg-red-100 text-red-700" };
  }
  if (p.statutTransfertSortant === "EN_ATTENTE") {
    return { cle: "aConfirmer", couleur: "bg-orange-100 text-orange-800" };
  }
  if (statutFileLabo(p) === "EN_COURS") {
    return { cle: "enCours", couleur: "bg-amber-50 text-amber-800" };
  }
  return { cle: "recu", couleur: "bg-emerald-50 text-emerald-700" };
}
