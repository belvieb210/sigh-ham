"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "@/locales/fr";
import en from "@/locales/en";
import ln from "@/locales/ln";
import sw from "@/locales/sw";
import kg from "@/locales/kg";
import lua from "@/locales/lua";
import es from "@/locales/es";
import de from "@/locales/de";
import hi from "@/locales/hi";
import pt from "@/locales/pt";
import zh from "@/locales/zh";
import he from "@/locales/he";
import ar from "@/locales/ar";
import type { CodeLangue } from "@/locales/types";
import {
  estLangueSupportee,
  LANGUE_DEFAUT,
  LANGUES_SUPPORTEES,
} from "@/lib/i18n-config";

export {
  CLE_STOCKAGE_LANGUE,
  LANGUE_DEFAUT,
  LANGUES_SUPPORTEES,
  estLangueSupportee,
  obtenirLangueStockee,
  ecrireCookieLangue,
  resoudreLangue,
} from "@/lib/i18n-config";

export const ressources = {
  fr,
  en,
  ln,
  sw,
  kg,
  lua,
  es,
  de,
  hi,
  pt,
  zh,
  he,
  ar,
} as const;

let initialise = false;

/** Initialise i18n côté client uniquement (react-i18next). */
export function initialiserI18n(langue: CodeLangue = LANGUE_DEFAUT) {
  const lng = estLangueSupportee(langue) ? langue : LANGUE_DEFAUT;

  if (!initialise) {
    i18n.use(initReactI18next).init({
      resources: ressources,
      lng,
      fallbackLng: {
        fr: [],
        en: [],
        default: [],
      },
      load: "languageOnly",
      supportedLngs: LANGUES_SUPPORTEES,
      interpolation: { escapeValue: false },
      returnObjects: true,
      react: {
        useSuspense: false,
        bindI18n: "languageChanged",
      },
    });
    initialise = true;
  }

  return i18n;
}

/**
 * Aligne i18n sur la langue SSR (cookie) avant hydratation.
 * Évite « Messagerie SIGH » (serveur) vs « Mesaje SIGH » (client).
 */
export function forcerLangueHydratation(langue: CodeLangue) {
  const lng = estLangueSupportee(langue) ? langue : LANGUE_DEFAUT;
  initialiserI18n(lng);
  if (i18n.language !== lng) {
    i18n.language = lng;
  }
  return i18n;
}

export default i18n;
