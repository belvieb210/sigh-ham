import type { TypeSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";
import { estValeurAutres } from "@/lib/laboratoire/config-saisie-parametre";

export type StatutIndicateur =
  | "bas"
  | "normal"
  | "eleve"
  | "non_requis"
  | "vide"
  | "saisi";

/** B / N / E persistés en base — dérivés de l'indicateur, plus de saisie manuelle. */
export type FlagIndicateurBne = "B" | "N" | "E";

export function valeurEffectivePourIndicateur(
  valeur: string,
  valeurSecondaire: string | null | undefined,
  typeSaisie?: TypeSaisieParametre
): string {
  if (typeSaisie === "resultat_valeur") {
    return valeur.trim();
  }
  if (estValeurAutres(valeur) && valeurSecondaire?.trim()) {
    return valeurSecondaire.trim();
  }
  if (valeur.trim()) return valeur.trim();
  return valeurSecondaire?.trim() ?? "";
}

function parseNombre(texte: string): number | null {
  const n = Number.parseFloat(texte.replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function normaliserQualitatif(texte: string): string {
  return texte
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9+/-]/g, "");
}

type CategorieQualitative =
  | "negatif"
  | "positif"
  | "absent"
  | "present"
  | "sterile"
  | "normal"
  | "traces"
  | "autre";

function categoriserQualitatif(texte: string): CategorieQualitative | null {
  const n = normaliserQualitatif(texte);
  if (!n) return null;

  if (
    n === "negatif" ||
    n === "negative" ||
    n === "neg" ||
    n === "non" ||
    n === "nondetecte" ||
    n === "-" ||
    n.startsWith("negatif") ||
    n.includes("negatif")
  ) {
    return "negatif";
  }

  if (
    n === "positif" ||
    n === "positive" ||
    n === "pos" ||
    n === "+" ||
    n === "oui" ||
    n === "yes" ||
    n.startsWith("positif") ||
    n.includes("positif")
  ) {
    return "positif";
  }

  if (n.includes("trace")) {
    return "traces";
  }

  if (n === "absent" || n === "abs" || n.startsWith("absent") || n.includes("absent")) {
    return "absent";
  }

  if (
    n === "present" ||
    n === "pres" ||
    n === "detecte" ||
    n === "detectee" ||
    n.startsWith("present") ||
    n.includes("present") ||
    n.includes("detecte")
  ) {
    return "present";
  }

  if (n === "sterile" || n.includes("sterile")) {
    return "sterile";
  }

  if (n === "normal" || n === "normale") {
    return "normal";
  }

  return "autre";
}

const NEGATIF_LIKE = new Set<CategorieQualitative>([
  "negatif",
  "absent",
  "sterile",
]);

const POSITIF_LIKE = new Set<CategorieQualitative>([
  "positif",
  "present",
  "traces",
]);

function referencesQualitativesEquivalentes(
  ref: CategorieQualitative,
  val: CategorieQualitative
): boolean {
  if (ref === val) return true;
  if (NEGATIF_LIKE.has(ref) && NEGATIF_LIKE.has(val)) return true;
  if (POSITIF_LIKE.has(ref) && POSITIF_LIKE.has(val)) return true;
  return false;
}

function evaluerQualitatif(
  valeur: string,
  rangeUsuelle: string
): StatutIndicateur | null {
  const ref = categoriserQualitatif(rangeUsuelle);
  const val = categoriserQualitatif(valeur);
  if (!ref || !val) return null;
  if (val === "autre") return null;
  if (referencesQualitativesEquivalentes(ref, val)) return "normal";
  if (NEGATIF_LIKE.has(ref) && POSITIF_LIKE.has(val)) return "eleve";
  if (POSITIF_LIKE.has(ref) && NEGATIF_LIKE.has(val)) return "bas";
  return "eleve";
}

function compterPlus(valeur: string): number {
  const m = valeur.match(/\+/g);
  return m ? m.length : 0;
}

function evaluerSymbolique(
  valeur: string,
  rangeUsuelle: string
): StatutIndicateur | null {
  const range = rangeUsuelle.trim();
  const rangeNorm = normaliserQualitatif(range);
  const valNorm = normaliserQualitatif(valeur);
  const plus = compterPlus(valeur);

  if (range === "0" || rangeNorm === "0") {
    const num = parseNombre(valeur);
    if (num !== null) {
      if (num === 0) return "normal";
      if (num > 0) return "eleve";
      return "bas";
    }
    if (
      plus > 0 ||
      valNorm === "positif" ||
      valNorm === "present" ||
      valNorm === "traces" ||
      valNorm.includes("detecte")
    ) {
      return "eleve";
    }
    if (NEGATIF_LIKE.has(categoriserQualitatif(valeur) ?? "autre")) {
      return "normal";
    }
    return null;
  }

  if (plus > 0) {
    if (NEGATIF_LIKE.has(categoriserQualitatif(range) ?? "autre")) {
      return plus >= 1 ? "eleve" : "normal";
    }
  }

  if (rangeNorm === "normal") {
    if (valNorm === "normal" || valNorm === "nondetecte") return "normal";
    if (valNorm === "detecte" || valNorm === "present" || plus > 0) return "eleve";
  }

  if (rangeNorm.includes("negatif") || rangeNorm.includes("neg")) {
    const q = evaluerQualitatif(valeur, range);
    if (q) return q;
  }

  return null;
}

function evaluerNumerique(valeur: string, rangeUsuelle: string): StatutIndicateur | null {
  const num = parseNombre(valeur);
  if (num === null) return null;

  const range = rangeUsuelle.trim();

  const entre = range.match(/(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)/);
  if (entre) {
    const min = parseNombre(entre[1]!);
    const max = parseNombre(entre[2]!);
    if (min === null || max === null) return null;
    if (num < min) return "bas";
    if (num > max) return "eleve";
    return "normal";
  }

  const sup = range.match(/^>\s*=?\s*(\d+[.,]?\d*)/);
  if (sup) {
    const min = parseNombre(sup[1]!);
    if (min === null) return null;
    return num >= min ? "normal" : "bas";
  }

  const inf = range.match(/^<\s*=?\s*(\d+[.,]?\d*)/);
  if (inf) {
    const max = parseNombre(inf[1]!);
    if (max === null) return null;
    return num <= max ? "normal" : "eleve";
  }

  return null;
}

export function evaluerIndicateur(
  valeur: string,
  rangeUsuelle: string | null,
  nonRequis: boolean
): StatutIndicateur {
  if (nonRequis) return "non_requis";
  if (!valeur.trim()) return "vide";

  const range = rangeUsuelle?.trim() ?? "";
  if (!range) return "saisi";

  const numerique = evaluerNumerique(valeur, range);
  if (numerique) return numerique;

  const symbolique = evaluerSymbolique(valeur, range);
  if (symbolique) return symbolique;

  const qualitatif = evaluerQualitatif(valeur, range);
  if (qualitatif) return qualitatif;

  return "saisi";
}

export function statutVersFlagBne(statut: StatutIndicateur): FlagIndicateurBne | null {
  switch (statut) {
    case "bas":
      return "B";
    case "normal":
      return "N";
    case "eleve":
      return "E";
    default:
      return null;
  }
}

/** Calcule le flag B/N/E à persister — même logique que l'indicateur visuel. */
export function calculerFlagDepuisParametre(input: {
  valeur: string;
  valeurSecondaire?: string | null;
  rangeUsuelle: string | null;
  nonRequis: boolean;
  typeSaisie?: TypeSaisieParametre;
}): FlagIndicateurBne | null {
  const valeurIndicateur = valeurEffectivePourIndicateur(
    input.valeur,
    input.valeurSecondaire,
    input.typeSaisie
  );
  const statut = evaluerIndicateur(
    valeurIndicateur,
    input.rangeUsuelle,
    input.nonRequis
  );
  return statutVersFlagBne(statut);
}
