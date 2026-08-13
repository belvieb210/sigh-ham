import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

function nettoyerUnite(unite: string | undefined): string {
  return (unite ?? "").trim().replace(/[Μμ]/g, "µ");
}

function afficherValeur(l: LigneParametrePdf): string {
  const other = (l.other ?? "").trim();
  const val = (l.value ?? "").trim();
  const unit = nettoyerUnite(l.unit);
  if (other) return other.toUpperCase();
  if (val && unit) return `${val.toUpperCase()} ${unit}`;
  return val.toUpperCase();
}

export interface GroupeSerologiePdf {
  prefix: string;
  resultat: string;
  valeur: string;
}

export interface GroupeTorchPdf extends GroupeSerologiePdf {
  range: string;
}

function afficherResultatSansUnite(l: LigneParametrePdf): string {
  const other = (l.other ?? "").trim();
  const val = (l.value ?? "").trim();
  if (other) return other.toUpperCase();
  return val.toUpperCase();
}

function afficherValeurAvecUnite(l: LigneParametrePdf): string {
  const other = (l.other ?? "").trim();
  const val = (l.value ?? "").trim();
  const unit = nettoyerUnite(l.unit);
  if (other) return other.toUpperCase();
  if (val && unit) return `${val.toUpperCase()} ${unit}`;
  return val.toUpperCase();
}

/** Regroupe paires TORCH RESULTAT + VALEUR + range (port renderBilansTorch PHP). */
export function grouperParametresTorch(lignes: LigneParametrePdf[]): {
  groupes: GroupeTorchPdf[];
  restants: LigneParametrePdf[];
} {
  const groups: Record<string, { resultat?: string; valeur?: string; range?: string }> = {};
  const used = new Set<number>();

  for (let i = 0; i < lignes.length; i++) {
    const r = lignes[i]!;
    const name = r.name.trim();

    if (/\s+RESULTAT$/i.test(name)) {
      const prefix = name.replace(/\s+RESULTAT$/i, "").trim();
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix].resultat = afficherResultatSansUnite(r);
      groups[prefix].range = (r.range ?? "").trim();
      used.add(i);
      continue;
    }

    if (/\s+VALEUR(?:S|\(S\))?$/i.test(name)) {
      const prefix = name.replace(/\s+VALEUR(?:S|\(S\))?$/i, "").trim();
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix].valeur = afficherValeurAvecUnite(r);
      used.add(i);
    }
  }

  const groupes: GroupeTorchPdf[] = Object.entries(groups).map(([prefix, vals]) => ({
    prefix,
    resultat: vals.resultat ?? "",
    valeur: vals.valeur ?? "",
    range: vals.range ?? "",
  }));

  return { groupes, restants: lignes.filter((_, i) => !used.has(i)) };
}

/** Regroupe paires RESULTAT + VALEUR (port renderMalaria / renderSerologie PHP). */
export function grouperParametresSerologie(
  lignes: LigneParametrePdf[],
  options?: { prefixesMalaria?: boolean }
): { groupes: GroupeSerologiePdf[]; restants: LigneParametrePdf[] } {
  const groups: Record<string, { resultat?: string; valeur?: string }> = {};
  const used = new Set<number>();

  for (let i = 0; i < lignes.length; i++) {
    const r = lignes[i]!;
    const name = r.name.trim();
    const display = afficherValeur(r);

    if (/\s+VALEURS?$/i.test(name)) {
      const prefix = name.replace(/\s+VALEURS?$/i, "").trim();
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix].valeur = display;
      used.add(i);
      continue;
    }

    if (/\s+RESULTAT$/i.test(name)) {
      const prefix = name.replace(/\s+RESULTAT$/i, "").trim();
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix].resultat = display;
      used.add(i);
      continue;
    }

    if (options?.prefixesMalaria) {
      if (/^(FALCIPARUM\s*\(Pf\)|MALAIAE\s+ET\s+AUTRES\s*\(PAN\))$/i.test(name)) {
        const prefix = name.trim();
        if (!groups[prefix]) groups[prefix] = {};
        groups[prefix].resultat = display;
        used.add(i);
      }
    }
  }

  const groupes: GroupeSerologiePdf[] = Object.entries(groups).map(
    ([prefix, vals]) => ({
      prefix,
      resultat: vals.resultat ?? "",
      valeur: vals.valeur ?? "",
    })
  );

  const restants = lignes.filter((_, i) => !used.has(i));
  return { groupes, restants };
}

/** Sépare méthodes vs espèces Plasmodium (port renderMalariaTDR PHP). */
export function parserMalariaTDR(lignes: LigneParametrePdf[]) {
  const methodes: LigneParametrePdf[] = [];
  const especes: LigneParametrePdf[] = [];
  let densiteVal = "";
  let entreeDensite: LigneParametrePdf | null = null;

  for (const l of lignes) {
    if (/plasmodi|gam/i.test(l.name)) {
      especes.push(l);
      continue;
    }
    if (/densit\w* parasitaire/i.test(l.name)) {
      entreeDensite = l;
      densiteVal = (l.value ?? "").trim() || (l.other ?? "").trim();
      continue;
    }
    methodes.push(l);
  }

  let methodesFinales = methodes;
  const dropDensityRow = methodes.some(
    (m) => (m.value ?? "").trim().toUpperCase() === "DENSITE PARASITAIRE"
  );
  if (dropDensityRow && entreeDensite) {
    methodesFinales = methodes.filter(
      (m) => (m.value ?? "").trim().toUpperCase() !== "DENSITE PARASITAIRE"
    );
  } else if (entreeDensite && densiteVal) {
    methodesFinales = [...methodes, entreeDensite];
  }

  return { methodes: methodesFinales, especes, densiteVal };
}

export function texteMethodeMalariaTDR(
  l: LigneParametrePdf,
  densiteVal: string
): string {
  const rawVal = (l.value ?? "").trim();
  const other = (l.other ?? "").trim();
  if (/densit\w* parasitaire/i.test(l.name) && densiteVal) {
    return densiteVal;
  }
  if (other) return other.replace(/[Μμ]/g, "µ");
  if (rawVal.toUpperCase() === "AUTRES") return "";
  return rawVal.replace(/[Μμ]/g, "µ");
}
