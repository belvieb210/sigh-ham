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

/**
 * Locales dont la messagerie est encore une copie FR :
 * on injecte le bloc EN pour que le changement de langue soit visible
 * (chaîne de secours entreprise : locale → en → fr).
 */
const LANGUES_MESSAGERIE_EN_SECOURS: CodeLangue[] = [
  "es",
  "de",
  "hi",
  "pt",
  "lua",
  "he",
  "ar",
];

let initialise = false;

function appliquerMessagerieEnSecours() {
  const messagerieEn = (
    ressources.en.translation as { reception?: { messagerie?: unknown } }
  ).reception?.messagerie;
  if (!messagerieEn) return;

  for (const code of LANGUES_MESSAGERIE_EN_SECOURS) {
    i18n.addResourceBundle(
      code,
      "translation",
      { reception: { messagerie: messagerieEn } },
      true,
      true
    );
  }
}

/** Initialise i18n côté client uniquement (react-i18next). */
export function initialiserI18n(langue: CodeLangue = LANGUE_DEFAUT) {
  const lng = estLangueSupportee(langue) ? langue : LANGUE_DEFAUT;

  if (!initialise) {
    i18n.use(initReactI18next).init({
      resources: ressources,
      lng,
      // Chaîne entreprise : langue active → anglais → français
      fallbackLng: {
        fr: ["fr"],
        en: ["fr"],
        ln: ["fr"],
        sw: ["fr"],
        kg: ["fr"],
        zh: ["fr"],
        es: ["en", "fr"],
        de: ["en", "fr"],
        hi: ["en", "fr"],
        pt: ["en", "fr"],
        lua: ["en", "fr"],
        he: ["en", "fr"],
        ar: ["en", "fr"],
        default: ["fr"],
      },
      load: "languageOnly",
      supportedLngs: [...LANGUES_SUPPORTEES, "cimode"],
      nonExplicitSupportedLngs: true,
      interpolation: { escapeValue: false },
      returnObjects: true,
      returnNull: false,
      parseMissingKeyHandler: (cle) => cle,
      react: {
        useSuspense: false,
        bindI18n: "languageChanged loaded",
        bindI18nStore: "added removed",
      },
    });
    appliquerMessagerieEnSecours();
    initialise = true;
  }

  return i18n;
}

/**
 * Aligne i18n sur la langue SSR (cookie) avant hydratation.
 * Évite « Messagerie SIGH » (serveur) vs libellé client.
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
