export type StatutIndicateur = "bas" | "normal" | "eleve" | "non_requis" | "vide";

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

export function evaluerIndicateur(
  valeur: string,
  rangeUsuelle: string | null,
  nonRequis: boolean
): StatutIndicateur {
  if (nonRequis) return "non_requis";
  if (!valeur.trim()) return "vide";

  const num = parseNombre(valeur);
  if (num === null || !rangeUsuelle?.trim()) return "vide";

  const range = rangeUsuelle.trim();

  const entre = range.match(/(\d+[.,]?\d*)\s*[-–]\s*(\d+[.,]?\d*)/);
  if (entre) {
    const min = parseNombre(entre[1]!);
    const max = parseNombre(entre[2]!);
    if (min === null || max === null) return "vide";
    if (num < min) return "bas";
    if (num > max) return "eleve";
    return "normal";
  }

  const sup = range.match(/^>\s*=?\s*(\d+[.,]?\d*)/);
  if (sup) {
    const min = parseNombre(sup[1]!);
    if (min === null) return "vide";
    return num >= min ? "normal" : "bas";
  }

  const inf = range.match(/^<\s*=?\s*(\d+[.,]?\d*)/);
  if (inf) {
    const max = parseNombre(inf[1]!);
    if (max === null) return "vide";
    return num <= max ? "normal" : "eleve";
  }

  return "vide";
}

export const COULEURS_INDICATEUR: Record<
  StatutIndicateur,
  { dot: string; input: string; text: string }
> = {
  bas: {
    dot: "bg-sky-500",
    input: "border-sky-300 bg-sky-50/40 focus:border-sky-500 focus:ring-sky-200",
    text: "text-sky-700",
  },
  normal: {
    dot: "bg-emerald-500",
    input: "border-emerald-300 bg-emerald-50/40 focus:border-emerald-500 focus:ring-emerald-200",
    text: "text-emerald-700",
  },
  eleve: {
    dot: "bg-rose-500",
    input: "border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200",
    text: "text-rose-700",
  },
  non_requis: {
    dot: "bg-slate-300",
    input: "border-slate-200 bg-slate-50 text-slate-400",
    text: "text-slate-400",
  },
  vide: {
    dot: "bg-transparent border border-slate-200",
    input: "border-violet-200 bg-violet-50/30 focus:border-violet-400 focus:ring-violet-100",
    text: "text-slate-400",
  },
};
