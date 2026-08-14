export type StatutIndicateur =
  | "bas"
  | "normal"
  | "eleve"
  | "non_requis"
  | "vide"
  | "saisi";

export function formaterParametre(nom: string): { acronyme: string; libelle: string } {
  const nettoye = nom.trim();
  if (!nettoye) return { acronyme: "—", libelle: "" };

  const tiret = nettoye.match(/^(.+?)\s[-–—]\s(.+)$/);
  if (tiret) {
    return { acronyme: tiret[1]!.trim(), libelle: tiret[2]!.trim() };
  }

  if (nettoye.length <= 10 && nettoye === nettoye.toUpperCase()) {
    return { acronyme: nettoye, libelle: "" };
  }

  const mots = nettoye.split(/\s+/).filter(Boolean);
  if (mots.length >= 2) {
    const initiales = mots
      .map((m) => m.replace(/[^a-zA-ZÀ-ÿ0-9]/g, "")[0]?.toUpperCase() ?? "")
      .join("");
    if (initiales.length >= 2) {
      return { acronyme: initiales, libelle: nettoye };
    }
  }

  if (mots.length > 1 && mots[0]!.length <= 8) {
    return { acronyme: mots[0]!.toUpperCase(), libelle: nettoye };
  }

  return { acronyme: nettoye.slice(0, 12), libelle: nettoye };
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
  | "autre";

function categoriserQualitatif(texte: string): CategorieQualitative | null {
  const n = normaliserQualitatif(texte);
  if (!n) return null;

  if (
    n === "negatif" ||
    n === "negative" ||
    n === "neg" ||
    n === "non" ||
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

function referencesQualitativesEquivalentes(
  ref: CategorieQualitative,
  val: CategorieQualitative
): boolean {
  if (ref === val) return true;

  const negatifLike = new Set<CategorieQualitative>(["negatif", "absent", "sterile"]);
  const positifLike = new Set<CategorieQualitative>(["positif", "present"]);

  if (negatifLike.has(ref) && negatifLike.has(val)) return true;
  if (positifLike.has(ref) && positifLike.has(val)) return true;

  return false;
}

function evaluerQualitatif(
  valeur: string,
  rangeUsuelle: string
): StatutIndicateur | null {
  const ref = categoriserQualitatif(rangeUsuelle);
  const val = categoriserQualitatif(valeur);
  if (!ref || !val) return null;
  if (val === "autre") return "saisi";
  return referencesQualitativesEquivalentes(ref, val) ? "normal" : "eleve";
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
  nonRequis: boolean,
  flag?: string | null
): StatutIndicateur {
  if (nonRequis) return "non_requis";
  if (flag === "B") return "bas";
  if (flag === "N") return "normal";
  if (flag === "E") return "eleve";
  if (!valeur.trim() && !flag?.trim()) return "vide";

  const range = rangeUsuelle?.trim() ?? "";
  if (!range) return "saisi";

  const numerique = evaluerNumerique(valeur, range);
  if (numerique) return numerique;

  const qualitatif = evaluerQualitatif(valeur, range);
  if (qualitatif) return qualitatif;

  return "saisi";
}

export const COULEURS_INDICATEUR: Record<
  StatutIndicateur,
  { dot: string; input: string; text: string }
> = {
  bas: {
    dot: "bg-sky-500",
    input: "border-sky-400 bg-sky-50/60 focus:border-sky-500 focus:ring-sky-200",
    text: "text-sky-700",
  },
  normal: {
    dot: "bg-emerald-500",
    input: "border-emerald-400 bg-emerald-50/60 focus:border-emerald-500 focus:ring-emerald-200",
    text: "text-emerald-700",
  },
  eleve: {
    dot: "bg-rose-500",
    input: "border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-200",
    text: "text-rose-700",
  },
  non_requis: {
    dot: "bg-slate-300",
    input: "border-slate-200 bg-slate-50 text-slate-400",
    text: "text-slate-400",
  },
  vide: {
    dot: "bg-transparent border border-slate-200",
    input: "border-slate-300 bg-white focus:border-violet-500 focus:ring-violet-200",
    text: "text-slate-600",
  },
  saisi: {
    dot: "bg-violet-500",
    input: "border-slate-300 bg-white focus:border-violet-500 focus:ring-violet-200",
    text: "text-slate-900",
  },
};
