import {
  DIAPOSITIVES_HERO_ACCUEIL,
} from "@/constants/hero-accueil";
import type { DiapositiveHeroAccueil } from "@/types/hero-accueil";

/**
 * Récupère les diapositives du hero accueil.
 * Phase future : remplacer par GET /api/hero-accueil?publie=true
 */
export async function obtenirDiapositivesHeroAccueil(): Promise<
  DiapositiveHeroAccueil[]
> {
  // await fetch('/api/hero-accueil') …
  return DIAPOSITIVES_HERO_ACCUEIL.filter((d) => d.publie).sort(
    (a, b) => a.ordre - b.ordre
  );
}
