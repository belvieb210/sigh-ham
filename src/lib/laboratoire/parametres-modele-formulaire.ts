import { OPTIONS_SAISIE_PAR_FORMULAIRE } from "@/lib/laboratoire/options-saisie-modaux";
import { cleTableFormulaire } from "@/lib/laboratoire/formulaire-depuis-categorie";

/** Noms de paramètres du modèle de saisie pour un formulaire donné. */
export function nomsParametresDepuisFormulaire(
  formulaire: string | null | undefined
): string[] {
  const cle = cleTableFormulaire(formulaire);
  if (!cle) return [];
  const table = OPTIONS_SAISIE_PAR_FORMULAIRE[cle];
  if (!table) return [];
  return Object.keys(table).filter((k) => !k.startsWith("__"));
}
