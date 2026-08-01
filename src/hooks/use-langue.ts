"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  CLE_STOCKAGE_LANGUE,
  ecrireCookieLangue,
  estLangueSupportee,
} from "@/lib/i18n";
import type { CodeLangue } from "@/locales/types";

function appliquerDirection(code: CodeLangue) {
  document.documentElement.dir = code === "he" || code === "ar" ? "rtl" : "ltr";
}

export function useLangue() {
  const { i18n } = useTranslation();
  const code = i18n.resolvedLanguage ?? i18n.language;
  const langueActuelle = (estLangueSupportee(code) ? code : "fr") as CodeLangue;

  const changerLangue = useCallback(
    async (nouvelleLangue: CodeLangue) => {
      await i18n.changeLanguage(nouvelleLangue);
      localStorage.setItem(CLE_STOCKAGE_LANGUE, nouvelleLangue);
      ecrireCookieLangue(nouvelleLangue);
      document.documentElement.lang = nouvelleLangue;
      appliquerDirection(nouvelleLangue);
    },
    [i18n]
  );

  return { langueActuelle, changerLangue };
}
