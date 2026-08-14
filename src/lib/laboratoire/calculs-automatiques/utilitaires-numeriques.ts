import type { FormatValeurCalculee } from "@/lib/laboratoire/calculs-automatiques/types";

export function normaliserNomParametre(nom: string): string {
  return nom.trim().toUpperCase();
}

export function parseValeurNumerique(valeur: string | null | undefined): number | null {
  const brut = (valeur ?? "").trim().replace(",", ".");
  if (!brut) return null;
  const n = Number.parseFloat(brut);
  return Number.isFinite(n) ? n : null;
}

/** Reprend la logique legacy `formatNumber` de labo.js */
export function formaterValeurCalculee(
  valeur: number,
  format: FormatValeurCalculee = "defaut"
): string {
  if (format === "entier") {
    return Math.round(valeur).toString();
  }
  if (format === "pourcentage" || format === "numeration") {
    return valeur % 1 === 0 ? valeur.toFixed(0) : valeur.toFixed(1);
  }
  if (valeur % 1 === 0) {
    return valeur.toString();
  }
  return valeur.toFixed(2).replace(/\.?0+$/, "");
}
