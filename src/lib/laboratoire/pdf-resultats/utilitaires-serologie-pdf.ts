import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";
import {
  valeurAffichageParametre,
  valeurSecondaireAffichagePdf,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

function afficherValeur(l: LigneParametrePdf): string {
  return valeurAffichageParametre(l);
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
  return valeurAffichageParametre(l);
}

function afficherValeurAvecUnite(l: LigneParametrePdf): string {
  return valeurAffichageParametre(l);
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

/** Retire suffixes RESULTAT / VALEUR répétés (port renderWidal PHP). */
export function normaliserNomParametreWidal(rawName: string): string {
  return rawName
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?:\s+(?:RESULTAT|VALEURS?))+$/iu, "")
    .trim();
}

function afficherResultatPrincipal(l: LigneParametrePdf): string {
  return valeurAffichageParametre(l);
}

function afficherTitreOuValeurSecondaire(l: LigneParametrePdf): string {
  return valeurSecondaireAffichagePdf(l);
}

function estNomResultatsSeul(name: string): boolean {
  return /^R[EÉ]SULTAT:?$/i.test(name.trim());
}

function estNomValeurSeul(name: string): boolean {
  return /^VALEURS?$/i.test(name.trim());
}

/** Regroupe paires RESULTAT + VALEUR (port renderMalaria / renderSerologie PHP). */
export function grouperParametresSerologie(
  lignes: LigneParametrePdf[],
  options?: { prefixesMalaria?: boolean; normaliserPrefixe?: boolean }
): { groupes: GroupeSerologiePdf[]; restants: LigneParametrePdf[] } {
  const groups: Record<string, { resultat?: string; valeur?: string }> = {};
  const used = new Set<number>();
  const normaliser = options?.normaliserPrefixe
    ? normaliserNomParametreWidal
    : (s: string) => s.trim();
  const ordrePrefixes: string[] = [];

  const assurerPrefix = (prefix: string) => {
    if (!groups[prefix]) {
      groups[prefix] = {};
      ordrePrefixes.push(prefix);
    }
  };

  for (let i = 0; i < lignes.length; i++) {
    const r = lignes[i]!;
    const name = r.name.trim();

    if (/\s+VALEURS?$/i.test(name)) {
      const prefix = normaliser(name.replace(/\s+VALEURS?$/i, ""));
      assurerPrefix(prefix);
      groups[prefix].valeur = afficherValeur(r);
      used.add(i);
      continue;
    }

    if (/\s+R[EÉ]SULTAT:?$/i.test(name)) {
      const prefix = normaliser(name.replace(/\s+R[EÉ]SULTAT:?$/i, ""));
      assurerPrefix(prefix);
      groups[prefix].resultat = afficherResultatPrincipal(r);
      if (!(groups[prefix].valeur ?? "").trim()) {
        const titre = afficherTitreOuValeurSecondaire(r);
        if (titre) groups[prefix].valeur = titre;
      }
      used.add(i);
      continue;
    }

    if (options?.prefixesMalaria) {
      if (/^(FALCIPARUM\s*\(Pf\)|MALAIAE\s+ET\s+AUTRES\s*\(PAN\))$/i.test(name)) {
        const prefix = name.trim();
        assurerPrefix(prefix);
        groups[prefix].resultat = afficherResultatPrincipal(r);
        used.add(i);
      }
    }
  }

  // Format moderne : une ligne par antigène (valeur = résultat, other = titre).
  let resultatGlobal = "";
  let valeurGlobale = "";
  let aResultatsGlobal = false;
  let aValeurGlobale = false;

  for (let i = 0; i < lignes.length; i++) {
    if (used.has(i)) continue;
    const r = lignes[i]!;
    const name = r.name.trim();

    if (estNomResultatsSeul(name)) {
      resultatGlobal = afficherResultatPrincipal(r);
      const titre = afficherTitreOuValeurSecondaire(r);
      if (titre) valeurGlobale = titre;
      aResultatsGlobal = true;
      used.add(i);
      continue;
    }

    if (estNomValeurSeul(name)) {
      valeurGlobale = afficherValeur(r);
      aValeurGlobale = true;
      used.add(i);
      continue;
    }
  }

  if (aResultatsGlobal || aValeurGlobale) {
    const prefix = "SÉROLOGIE";
    assurerPrefix(prefix);
    if (resultatGlobal) groups[prefix].resultat = resultatGlobal;
    if (valeurGlobale) groups[prefix].valeur = valeurGlobale;
  }

  for (let i = 0; i < lignes.length; i++) {
    if (used.has(i)) continue;
    const r = lignes[i]!;
    const name = r.name.trim();
    const resultat = afficherResultatPrincipal(r);
    const valeur = afficherTitreOuValeurSecondaire(r);
    if (!resultat && !valeur) continue;

    const prefix = normaliser(name.replace(/:$/, ""));
    if (!prefix) continue;
    assurerPrefix(prefix);
    if (resultat) groups[prefix].resultat = resultat;
    if (valeur) groups[prefix].valeur = valeur;
    used.add(i);
  }

  const groupes: GroupeSerologiePdf[] = ordrePrefixes.map((prefix) => ({
    prefix,
    resultat: groups[prefix]?.resultat ?? "",
    valeur: groups[prefix]?.valeur ?? "",
  }));

  const restants = lignes
    .filter((_, i) => !used.has(i))
    .map((l) =>
      options?.normaliserPrefixe
        ? { ...l, name: normaliserNomParametreWidal(l.name) }
        : l
    );
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
  if (/densit\w* parasitaire/i.test(l.name) && densiteVal) {
    return densiteVal;
  }
  const sec = valeurSecondaireAffichagePdf(l);
  if (sec) return sec.replace(/[Μμ]/g, "µ");
  const val = valeurAffichageParametre(l);
  return val.replace(/[Μμ]/g, "µ");
}
