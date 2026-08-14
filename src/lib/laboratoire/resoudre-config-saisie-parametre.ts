import {
  OPTION_AUTRES,
  type ConfigSaisieParametre,
  avecOptionAutres,
  normaliserConfigSaisie,
} from "@/lib/laboratoire/config-saisie-parametre";

const FORMULAIRES_FLAG_VALEUR = new Set([
  "examForm",
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
  "bilansAnalyses",
  "fluide",
]);

const FORMULAIRES_RESULTAT_VALEUR = new Set([
  "serology",
  "widal",
  "salmonella",
  "malaria",
  "malariaTDR",
]);

const FORMULAIRES_SELECT_AUTRES = new Set([
  "urinesRoutines",
  "sellesRoutine",
  "rivalta",
  "sangOcculte",
  "sedimentUrinaire",
  "microbiologie",
  "coproculture",
  "frottis_secretion",
]);

const FORMULAIRES_DESCRIPTION = new Set(["histopathologie", "chargeViral"]);

const OPTIONS_NEGATIF_POSITIF = avecOptionAutres(["Négatif", "Positif"]);

const OPTIONS_URINES: Record<string, string[]> = {
  COULEUR: avecOptionAutres([
    "Jaune citrin",
    "Jaune pâle",
    "Jaune foncé",
    "Rouge",
    "Brun",
    "Vert",
    "Noir",
  ]),
  ASPECT: avecOptionAutres([
    "Clair",
    "Trouble",
    "Turbide",
    "Opalescent",
    "Purulent",
  ]),
  PH: avecOptionAutres(["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"]),
  DENSITE: avecOptionAutres([
    "1005",
    "1010",
    "1015",
    "1020",
    "1025",
    "1030",
    "1035",
  ]),
  PROTEINES: OPTIONS_NEGATIF_POSITIF,
  GLUCOSE: OPTIONS_NEGATIF_POSITIF,
  ACETONE: OPTIONS_NEGATIF_POSITIF,
  BILIRUBINE: OPTIONS_NEGATIF_POSITIF,
  UROBILINOGENE: OPTIONS_NEGATIF_POSITIF,
  NITRITES: OPTIONS_NEGATIF_POSITIF,
  LEUCOCYTES: OPTIONS_NEGATIF_POSITIF,
  SANG: OPTIONS_NEGATIF_POSITIF,
  HEMOGLOBINE: OPTIONS_NEGATIF_POSITIF,
};

const OPTIONS_SELLES = avecOptionAutres([
  "Formées",
  "Molles",
  "Liquides",
  "Pâteuses",
  "Grumeleuses",
]);

const OPTIONS_SEROLOGIE = avecOptionAutres([
  "Négatif",
  "Positif",
  "Douteux",
  "Non réactif",
  "Réactif",
]);

function optionsParNomParametre(
  formulaire: string | null | undefined,
  nomParametre: string
): string[] {
  const cle = nomParametre.trim().toUpperCase();
  if (formulaire === "urinesRoutines" || formulaire === "sedimentUrinaire") {
    return OPTIONS_URINES[cle] ?? OPTIONS_NEGATIF_POSITIF;
  }
  if (formulaire === "sellesRoutine") {
    if (cle.includes("CONSISTANCE") || cle.includes("ASPECT")) {
      return OPTIONS_SELLES;
    }
    return OPTIONS_NEGATIF_POSITIF;
  }
  if (FORMULAIRES_RESULTAT_VALEUR.has(formulaire ?? "")) {
    return OPTIONS_SEROLOGIE;
  }
  return OPTIONS_NEGATIF_POSITIF;
}

function infererConfigDepuisFormulaire(
  formulaire: string | null | undefined,
  nomParametre: string
): ConfigSaisieParametre {
  const f = formulaire ?? "";

  if (FORMULAIRES_DESCRIPTION.has(f)) {
    return { typeSaisie: "description" };
  }

  if (FORMULAIRES_RESULTAT_VALEUR.has(f)) {
    return {
      typeSaisie: "resultat_valeur",
      options: optionsParNomParametre(f, nomParametre),
      libelleSecondaire: "Valeur / Titre",
      placeholderSecondaire: "Titre ou valeur",
    };
  }

  if (FORMULAIRES_SELECT_AUTRES.has(f)) {
    return {
      typeSaisie: "select_autres",
      options: optionsParNomParametre(f, nomParametre),
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

/** Résout la config effective : BDD puis inférence par formulaire. */
export function resoudreConfigSaisieParametre(
  parametre: ParametrePourConfigSaisie
): ConfigSaisieParametre {
  const depuisBdd = normaliserConfigSaisie(parametre.configSaisie);
  if (depuisBdd) return depuisBdd;

  const nom = parametre.nom ?? "";
  const formulaire = parametre.typeExamen?.formulaire ?? null;
  return infererConfigDepuisFormulaire(formulaire, nom);
}

/** Valeur affichée dans le select « Autres » : stocke OPTION_AUTRES en valeur principale. */
export function valeurSelectAutres(
  valeur: string,
  valeurSecondaire: string | null | undefined
): string {
  if (valeurSecondaire?.trim()) return OPTION_AUTRES;
  return valeur;
}

/** Valeur principale persistée pour select_autres. */
export function persisterSelectAutres(
  selection: string,
  preciser: string
): { valeur: string; valeurSecondaire: string | null } {
  if (selection === OPTION_AUTRES) {
    return {
      valeur: OPTION_AUTRES,
      valeurSecondaire: preciser.trim() || null,
    };
  }
  return { valeur: selection, valeurSecondaire: null };
}
