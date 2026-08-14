import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

const EXPOSANTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function normaliserNotationScientifique(texte: string): string {
  if (!texte || !texte.includes("^")) return texte;
  return texte.replace(/\^(-?\d+)/g, (_, exp: string) => {
    let out = "";
    for (const ch of exp) out += EXPOSANTS[ch] ?? ch;
    return out;
  });
}

function nettoyerUnite(unite: string | null | undefined): string {
  const u = (unite ?? "").trim();
  if (!u) return "";
  const compact = u.replace(/\s+/g, "");
  if (/^-+$/.test(compact)) return "";
  if (["N/A", "NA", "NONE", "NULL"].includes(compact.toUpperCase())) return "";
  return u;
}

export function valeurAffichageParametre(ligne: LigneParametrePdf): string {
  const other = (ligne.other ?? "").trim();
  if (other) return normaliserNotationScientifique(other).toUpperCase();
  const val = normaliserNotationScientifique((ligne.value ?? "").trim());
  const unit = nettoyerUnite(ligne.unit);
  if (!val) return "";
  return unit ? `${val.toUpperCase()} ${unit}` : val.toUpperCase();
}

export function mapperResultatsPrismaVersPdf(
  resultats: {
    parametre: string;
    valeur: string;
    unite: string | null;
    normeMin: string | null;
    normeMax: string | null;
    nonRequis: boolean;
    anormal: boolean;
    flag: string | null;
    valeurSecondaire: string | null;
    commentaire: string | null;
  }[]
): LigneParametrePdf[] {
  return resultats
    .filter((r) => !r.nonRequis)
    .flatMap((r) => {
      let range = "";
      if (r.normeMin && r.normeMax) range = `${r.normeMin} - ${r.normeMax}`;
      else if (r.normeMin) range = r.normeMin;
      else if (r.normeMax) range = r.normeMax;

      const flag = r.flag?.trim() || (r.anormal ? "!" : "");
      const other = r.valeurSecondaire?.trim() || undefined;

      const ligne: LigneParametrePdf = {
        name: r.parametre,
        value: r.valeur,
        unit: nettoyerUnite(r.unite) || undefined,
        range: range || undefined,
        flag,
        other,
        nonRequis: r.nonRequis,
        commentaire: r.commentaire ?? undefined,
      };

      const nomUpper = r.parametre.trim().toUpperCase();
      if (
        other &&
        (nomUpper.includes("RESULTAT") || nomUpper.includes("RÉSULTAT")) &&
        !nomUpper.includes("VALEUR")
      ) {
        return [
          ligne,
          {
            name: "VALEUR",
            value: other,
            flag,
            nonRequis: r.nonRequis,
          },
        ];
      }

      return [ligne];
    });
}

/** Transforme un tableau [{name,value}] en objet plat (groupage sanguin). */
export function aplatirResultatsGroupage(
  lignes: LigneParametrePdf[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of lignes) {
    const key = l.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    if (key) {
      out[key] = (l.other ?? l.value ?? "").trim();
    }
  }
  return out;
}
