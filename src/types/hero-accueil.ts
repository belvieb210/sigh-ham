/** Diapositive du carrousel hero page d'accueil */

export interface DiapositiveHeroAccueil {
  id: string;
  url: string;
  alt: string;
  ordre: number;
  /** Visible sur le site public — géré par l'admin en phase 2 */
  publie: boolean;
}
