import { formaterMontantCaisse } from "@/features/caisse/utils-format";

/** Tarifs catalogue vitrine — montants en USD (comme en caisse / admin). */
export function formaterPrixExamenPublic(prix: number): string {
  return formaterMontantCaisse(prix, "USD");
}

export function formaterDelaiExamenPublic(delaiHeures: number): string {
  if (delaiHeures <= 2) return `${delaiHeures}h`;
  if (delaiHeures < 24) return `${delaiHeures}h`;
  if (delaiHeures === 24) return "24h";
  const jours = Math.round(delaiHeures / 24);
  return jours === 1 ? "24h" : `${jours}j`;
}
