import type { StatutIndicateur } from "@/lib/laboratoire/indicateur-resultat";

export type { StatutIndicateur } from "@/lib/laboratoire/indicateur-resultat";
export {
  calculerFlagDepuisParametre,
  evaluerIndicateur,
  statutVersFlagBne,
  valeurEffectivePourIndicateur,
} from "@/lib/laboratoire/indicateur-resultat";

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
