import type { ConfigSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";
import { normaliserConfigSaisie } from "@/lib/laboratoire/config-saisie-parametre";
import { optionsSaisieDepuisModaux } from "@/lib/laboratoire/options-saisie-modaux";

const FORMULAIRES_FLAG_VALEUR = new Set([
  "examForm",
  "bilansAnalyses",
  "bilans_azotes",
  "bilirubi",
  "ionogramme",
  "spot_urines",
  "proteinurie24",
  "ptt",
  "profilLipidique",
  "hematologie",
  "coagulation",
  "nfs",
  "nfl",
  "fluide",
  "reticulocyte",
  "hb_hct",
  "valeur_absolu_eosinophiles",
  "micro_albuminurie",
  "glycemie_gestationnelle",
  "surveillance_prostatique",
  "electrophorese",
]);

const FORMULAIRES_RESULTAT_VALEUR = new Set([
  "serology",
  "widal",
  "salmonella",
  "malaria",
  "trypanosomiase",
]);

const FORMULAIRES_DESCRIPTION = new Set(["histopathologie", "chargeViral"]);

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
  if (depuisModaux) return depuisModaux;

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

  if (FORMULAIRES_FLAG_VALEUR.has(f)) {
    return { typeSaisie: "flag_valeur" };
  }

  return { typeSaisie: "texte" };
}

export type ParametrePourConfigSaisie = {
  configSaisie?: unknown;
  nom?: string | null;
  typeExamen?: { formulaire?: string | null } | null;
};

/** Résout la config effective : BDD puis modaux.php puis inférence. */
export function resoudreConfigSaisieParametre(
  parametre: ParametrePourConfigSaisie
): ConfigSaisieParametre {
  const depuisBdd = normaliserConfigSaisie(parametre.configSaisie);
  if (depuisBdd) return depuisBdd;

  const nom = parametre.nom ?? "";
  const formulaire = parametre.typeExamen?.formulaire ?? null;
  return infererConfigDepuisFormulaire(formulaire, nom);
}

/** @deprecated Utiliser OPTION_AUTRES depuis config-saisie-parametre */
export { OPTION_AUTRES } from "@/lib/laboratoire/config-saisie-parametre";

/** Valeur affichée dans le select « Autres ». */
export function valeurSelectAutres(
  valeur: string,
  valeurSecondaire: string | null | undefined
): string {
  if (valeurSecondaire?.trim()) return "Autres";
  if (valeur.trim().toLowerCase() === "autres") return "Autres";
  return valeur;
}

/** Valeur principale persistée pour select_autres. */
export function persisterSelectAutres(
  selection: string,
  preciser: string
): { valeur: string; valeurSecondaire: string | null } {
  if (selection === "Autres" || selection.toLowerCase() === "autres") {
    return {
      valeur: "Autres",
      valeurSecondaire: preciser.trim() || null,
    };
  }
  return { valeur: selection, valeurSecondaire: null };
}
