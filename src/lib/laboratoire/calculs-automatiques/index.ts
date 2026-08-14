export type {
  FormatValeurCalculee,
  MetaCalculsFormulaire,
  ParametreCalculEntree,
  RegleDerive,
  RegleSomme,
  ResultatCalculsAutomatiques,
  SommeCalculMeta,
  StatutSommeCalcul,
} from "@/lib/laboratoire/calculs-automatiques/types";

export {
  aCalculsAutomatiques,
  appliquerCalculsAutomatiques,
  validerCalculsPourVerification,
} from "@/lib/laboratoire/calculs-automatiques/appliquer-calculs";

export {
  estChampCalculeAutomatique,
  obtenirConfigCalcul,
  resoudreCleCalculAutomatique,
} from "@/lib/laboratoire/calculs-automatiques/regles-par-formulaire";

export {
  formaterValeurCalculee,
  normaliserNomParametre,
  parseValeurNumerique,
} from "@/lib/laboratoire/calculs-automatiques/utilitaires-numeriques";
