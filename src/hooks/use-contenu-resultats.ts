"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CONTENU_RESULTATS } from "@/constants/resultats";
import type { PagesFr } from "@/locales/pages/fr";

function usePages(): PagesFr {
  const { i18n } = useTranslation();
  const langue = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    const bundle = i18n.getResourceBundle(langue, "translation");
    return (bundle?.pages ?? i18n.getResourceBundle("fr", "translation")?.pages) as PagesFr;
  }, [i18n, langue]);
}

export function useContenuResultats() {
  const pages = usePages();
  const contenu = pages.resultats ?? CONTENU_RESULTATS;
  return contenu;
}
