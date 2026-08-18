/** Listes du catalogue médicaments (fiche administration uniquement). */

export const VALEUR_AUTRES_PRECISER = "__AUTRES__";

export const CATEGORIES_MEDICAMENT = [
  "Analgésiques",
  "Anti-inflammatoires",
  "Antibactériens",
  "Antituberculeux",
  "Antilépreux",
  "Antimycosiques",
  "Antiviraux",
  "Cardiologie",
  "Dermatologie",
  "Diététique et Nutrition",
  "Endocrinologie",
  "Gastro-entérologie et hépatologie",
  "Gynécologie obstétrique et contraception",
  "Hématologie",
  "Immunologie et Allergologie",
  "Médicaments des troubles métaboliques",
  "Neurologie",
  "Ophtalmologie",
  "Oto-rhino-laryngologie",
  "Parasitologie",
  "Pneumologie",
  "Psychiatrie",
  "Réanimation et toxicologie",
  "Rhumatologie",
  "Stomatologie",
  "Urologie",
  "Cancérologie",
] as const;

export const FORMES_MEDICAMENT = [
  "Comprimé",
  "Capsule",
  "Gélule",
  "Sirop",
  "Crème",
  "Pommades",
  "Injection",
  "Suppositoires",
  "Ampoules Buvables",
  "Cachet Buvable",
] as const;

export const VOIES_ADMINISTRATION_MEDICAMENT = [
  "Voie Orale",
  "Transmuqueuses",
  "Buccales",
  "Respiratoires",
  "Nasale",
  "Rectale",
  "Cutanée Et Transcutanée",
  "Intraveineuse (Iv)",
  "Intramusculaire (Im)",
  "Intradermique (Id)",
  "Sous-Cutanée (Sc)",
  "Trachéobronchique",
  "Pulmonaire",
  "Oculaire",
  "Vaginale",
  "Auriculaire",
] as const;

export function choixDepuisValeur(
  valeur: string | null | undefined,
  options: readonly string[]
): { choix: string; autre: string } {
  const v = valeur?.trim() ?? "";
  if (!v) return { choix: "", autre: "" };
  if ((options as readonly string[]).includes(v)) return { choix: v, autre: "" };
  return { choix: VALEUR_AUTRES_PRECISER, autre: v };
}

export function valeurDepuisChoix(choix: string, autre: string): string | null {
  if (choix === VALEUR_AUTRES_PRECISER) return autre.trim() || null;
  return choix.trim() || null;
}
