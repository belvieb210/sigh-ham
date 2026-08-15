/** Chemins des images locales — remplaçables dans public/images/ */

export const IMAGES_HERO_ACCUEIL = "/images/hero/accueil.jpg";

export const IMAGES_FOND_A_PROPOS = [
  { url: "/images/a-propos/labo-1.jpg", alt: "Laboratoire d'analyses médicales HAM" },
  { url: "/images/a-propos/labo-2.jpg", alt: "Équipements de diagnostic moderne" },
  { url: "/images/a-propos/labo-3.jpg", alt: "Analyses en laboratoire" },
  { url: "/images/a-propos/labo-4.jpg", alt: "Centre médical et soins de qualité" },
] as const;

export const IMAGE_HERO_CAMPAGNES = "/images/a-propos/labo-2.jpg";
export const IMAGE_HERO_SERVICES = "/images/a-propos/labo-3.jpg";
export const IMAGE_HERO_CONTACT = "/images/a-propos/labo-4.jpg";
export const IMAGE_HERO_RENDEZ_VOUS = "/images/a-propos/labo-1.jpg";
export const IMAGE_HERO_SERVICES_LABORATOIRE = "/images/a-propos/labo-3.jpg";

/** Galerie laboratoire — carrousel service phare & visuels analytiques */
export const IMAGES_LABORATOIRE = IMAGES_FOND_A_PROPOS;
