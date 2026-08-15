"use client";

import { useEffect, useState } from "react";

const LIGNES_PAR_PAGE = 4;

/** Colonnes de la grille examens (aligné sur sm:2 xl:3). */
export function useColonnesGrilleExamens() {
  const [colonnes, setColonnes] = useState(1);

  useEffect(() => {
    const mediaSm = window.matchMedia("(min-width: 640px)");
    const mediaXl = window.matchMedia("(min-width: 1280px)");

    const maj = () => {
      if (mediaXl.matches) setColonnes(3);
      else if (mediaSm.matches) setColonnes(2);
      else setColonnes(1);
    };

    maj();
    mediaSm.addEventListener("change", maj);
    mediaXl.addEventListener("change", maj);
    return () => {
      mediaSm.removeEventListener("change", maj);
      mediaXl.removeEventListener("change", maj);
    };
  }, []);

  return colonnes;
}

export function useTaillePageExamens(colonnes: number) {
  return colonnes * LIGNES_PAR_PAGE;
}

export { LIGNES_PAR_PAGE };
