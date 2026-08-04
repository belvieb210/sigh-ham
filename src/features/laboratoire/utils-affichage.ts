import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

export function codeTransfertLaboratoire(p: PatientFileLaboratoire) {
  const n = String(p.numeroOrdre).padStart(4, "0");
  const d = new Date(p.arriveeLe);
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `TRF-${ym}-${n}`;
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
