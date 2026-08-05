import { DIAPOSITIVES_HERO_ACCUEIL } from "@/constants/hero-accueil";
import { chargerDiapositivesHero } from "@/lib/client/contenu-public";
import type { DiapositiveHeroAccueil } from "@/types/hero-accueil";

/**
 * Récupère les diapositives du hero accueil (DB, fallback constants).
 */
export async function obtenirDiapositivesHeroAccueil(): Promise<
  DiapositiveHeroAccueil[]
> {
  try {
    return await chargerDiapositivesHero();
  } catch {
    return DIAPOSITIVES_HERO_ACCUEIL.filter((d) => d.publie).sort(
      (a, b) => a.ordre - b.ordre
    );
  }
}
