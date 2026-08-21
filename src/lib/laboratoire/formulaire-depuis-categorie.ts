/**
 * Formulaire labo par défaut lorsqu’un examen n’a pas de `formulaire`
 * mais une catégorie connue. Aligné sur le catalogue (type → formulaire majoritaire).
 */
const FORMULAIRE_PAR_CATEGORIE: Record<string, string> = {
  microbiologie: "microbiologie",
  serologie: "serologie",
  hematologie: "hematologie",
  biochimie: "examForm",
  hormonologie: "examForm",
  immunologie: "examForm",
  hemostase: "coagulation",
  coagulation: "coagulation",
  fluides: "fluide",
  fluide: "fluide",
  histopathologie: "histopathologie",
  cytologie: "frottis_secretion",
  virologie: "charge_viral",
  bilans: "bilansAnalyses",
  // Parasitologie : formulaires trop hétérogènes → pas de défaut forcé
};

function sansAccentMinuscule(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Clé de table modaux (gère serologie → serology, charge_viral → chargeViral). */
export function cleTableFormulaire(
  formulaire: string | null | undefined
): string | null {
  if (!formulaire?.trim()) return null;
  const f = formulaire.trim();
  if (f === "serologie" || f === "seriologie") return "serology";
  if (f === "charge_viral" || f === "chargeviral") return "chargeViral";
  if (f === "profil_lipidique") return "profilLipidique";
  if (f === "selles_routine" || f === "sellesroutine") return "sellesRoutine";
  return f;
}

export function formulaireDepuisCategorie(
  categorie: string | null | undefined
): string | null {
  if (!categorie?.trim()) return null;
  const cle = sansAccentMinuscule(categorie);
  return FORMULAIRE_PAR_CATEGORIE[cle] ?? null;
}

/** Formulaire explicite de l’examen, sinon défaut de la catégorie. */
export function resoudreFormulaireExamen(
  formulaire: string | null | undefined,
  categorie: string | null | undefined
): string | null {
  const explicite = formulaire?.trim() || null;
  if (explicite) return explicite;
  return formulaireDepuisCategorie(categorie);
}
