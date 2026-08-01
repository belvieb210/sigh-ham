import type { DiapositiveHeroAccueil } from "@/types/hero-accueil";

/**
 * Carrousel hero accueil — source statique.
 *
 * Phase actuelle : constants + fichiers dans public/images/hero/carrousel/
 * Phase future   : GET /api/hero-accueil (admin upload & ordre)
 */
export const DIAPOSITIVES_HERO_ACCUEIL: DiapositiveHeroAccueil[] = [
  {
    id: "belvie-1-jpg",
    url: "/images/hero/carrousel/belvie-1.jpg",
    alt: "HAM Laboratoire — Centre de diagnostic",
    ordre: 1,
    publie: true,
  },
  {
    id: "belvie-1-png",
    url: "/images/hero/carrousel/belvie-1.png",
    alt: "HAM Laboratoire — Équipe et installations",
    ordre: 2,
    publie: true,
  },
  {
    id: "belvie-2-jpg",
    url: "/images/hero/carrousel/belvie-2.jpg",
    alt: "HAM Laboratoire — Nos locaux",
    ordre: 3,
    publie: true,
  },
  {
    id: "belvie-1-jpeg",
    url: "/images/hero/carrousel/belvie-1.jpeg",
    alt: "HAM Laboratoire — Accueil patients",
    ordre: 4,
    publie: true,
  },
];

/** Intervalle entre deux diapositives (ms) */
export const INTERVALLE_CARROUSEL_HERO_MS = 5500;
