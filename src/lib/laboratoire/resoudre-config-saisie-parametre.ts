import type { ConfigSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";
import {
  avecOptionAutres,
  normaliserConfigSaisie,
} from "@/lib/laboratoire/config-saisie-parametre";
import { optionsSaisieDepuisModaux } from "@/lib/laboratoire/options-saisie-modaux";

const FORMULAIRES_RESULTAT_VALEUR = new Set([
  "serology",
  "serologie",
  "widal",
  "salmonella",
  "malaria",
  "trypanosomiase",
]);

const FORMULAIRES_DESCRIPTION = new Set(["histopathologie", "chargeViral"]);

function sansFlagValeur(config: ConfigSaisieParametre): ConfigSaisieParametre {
  if (config.typeSaisie === "flag_valeur") {
    return { typeSaisie: "texte" };
  }
  return config;
}

function estNomDate(nom: string): boolean {
  const u = nom.trim().toUpperCase();
  return /^DATE(\s|$| DE| D')/.test(u);
}

function infererConfigDepuisFormulaire(
  formulaire: string | null | undefined,
  nomParametre: string
): ConfigSaisieParametre {
  const f = formulaire ?? "";

  const depuisModaux = optionsSaisieDepuisModaux(f, nomParametre);
  if (depuisModaux) return sansFlagValeur(depuisModaux);

  if (estNomDate(nomParametre)) {
    return { typeSaisie: "date" };
  }

  if (FORMULAIRES_DESCRIPTION.has(f)) {
    return { typeSaisie: "description" };
  }

  if (FORMULAIRES_RESULTAT_VALEUR.has(f)) {
    return {
      typeSaisie: "resultat_valeur",
      libelleSecondaire: "Valeur / Titre",
      placeholderSecondaire: "Titre ou valeur",
    };
  }

  return { typeSaisie: "texte" };
}

export type ParametrePourConfigSaisie = {
  configSaisie?: unknown;
  nom?: string | null;
  typeExamen?: { formulaire?: string | null } | null;
};

/** Paramètre nommé AUTRES : toujours proposer « Autres » + champ Préciser. */
function forcerSelectAutresSiNomAutres(
  nom: string,
  config: ConfigSaisieParametre
): ConfigSaisieParametre {
  const u = nom.trim().toUpperCase();
  if (u !== "AUTRES") return config;
  if (config.typeSaisie === "select" || config.typeSaisie === "select_autres") {
    return {
      ...config,
      typeSaisie: "select_autres",
      options: avecOptionAutres(config.options ?? []),
    };
  }
  if (config.typeSaisie === "texte") {
    return { typeSaisie: "select_autres", options: avecOptionAutres([]) };
  }
  return config;
}

/** Résout la config effective : BDD puis modaux.php puis inférence. */
export function resoudreConfigSaisieParametre(
  parametre: ParametrePourConfigSaisie
): ConfigSaisieParametre {
  const nom = parametre.nom ?? "";
  const depuisBdd = normaliserConfigSaisie(parametre.configSaisie);
  if (depuisBdd) {
    return forcerSelectAutresSiNomAutres(nom, sansFlagValeur(depuisBdd));
  }

  const formulaire = parametre.typeExamen?.formulaire ?? null;
  return forcerSelectAutresSiNomAutres(
    nom,
    infererConfigDepuisFormulaire(formulaire, nom)
  );
}

/** @deprecated Utiliser OPTION_AUTRES depuis config-saisie-parametre */
export { OPTION_AUTRES } from "@/lib/laboratoire/config-saisie-parametre";

function estSelectionAutres(selection: string): boolean {
  const s = selection.trim().toLowerCase();
  return s === "autres" || s.includes("préciser") || s.includes("preciser");
}

/** Valeur affichée dans le select « Autres ». */
export function valeurSelectAutres(
  valeur: string,
  valeurSecondaire: string | null | undefined
): string {
  if (valeurSecondaire?.trim()) return "Autres";
  if (estSelectionAutres(valeur)) return "Autres";
  return valeur;
}

/** Valeur principale persistée pour select_autres. */
export function persisterSelectAutres(
  selection: string,
  preciser: string
): { valeur: string; valeurSecondaire: string | null } {
  if (estSelectionAutres(selection)) {
    return {
      valeur: "Autres",
      valeurSecondaire: preciser.trim() || null,
    };
  }
  return { valeur: selection, valeurSecondaire: null };
}
