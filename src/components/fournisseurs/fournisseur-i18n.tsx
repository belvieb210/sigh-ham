"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, {
  CLE_STOCKAGE_LANGUE,
  ecrireCookieLangue,
  estLangueSupportee,
  forcerLangueHydratation,
  obtenirLangueStockee,
} from "@/lib/i18n";
import type { CodeLangue } from "@/locales/types";

function appliquerDirection(code: CodeLangue) {
  document.documentElement.dir = code === "he" || code === "ar" ? "rtl" : "ltr";
}

/** Après la première hydratation, ne plus forcer la langue SSR (changement utilisateur). */
let hydratationTerminee = false;

interface PropsFournisseurI18n {
  children: React.ReactNode;
  /** Langue lue côté serveur (cookie) — aligne SSR et premier rendu client. */
  langueInitiale: CodeLangue;
}

/** Fournit i18n à toute l'application, synchronisé avec le cookie SSR. */
export function FournisseurI18n({ children, langueInitiale }: PropsFournisseurI18n) {
  if (!hydratationTerminee) {
    forcerLangueHydratation(langueInitiale);
  }

  useEffect(() => {
    hydratationTerminee = true;

    const stockee = obtenirLangueStockee();
    /** Migration localStorage → cookie : uniquement après hydratation. */
    const langue =
      langueInitiale === "fr" && stockee !== "fr" ? stockee : langueInitiale;

    if (i18n.language !== langue) {
      void i18n.changeLanguage(langue);
    }

    localStorage.setItem(CLE_STOCKAGE_LANGUE, langue);
    ecrireCookieLangue(langue);
    document.documentElement.lang = langue;
    appliquerDirection(langue);

    const onLangueChange = (code: string) => {
      if (estLangueSupportee(code)) {
        document.documentElement.lang = code;
        appliquerDirection(code);
      }
    };
    i18n.on("languageChanged", onLangueChange);
    return () => {
      i18n.off("languageChanged", onLangueChange);
    };
  }, [langueInitiale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
