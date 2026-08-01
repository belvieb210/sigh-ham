import type { CodeLangue } from "@/locales/types";

export const CLE_STOCKAGE_LANGUE = "ham-langue";

export const LANGUE_DEFAUT: CodeLangue = "fr";

export const LANGUES_SUPPORTEES: CodeLangue[] = [
  "fr",
  "en",
  "ln",
  "sw",
  "kg",
  "lua",
  "es",
  "de",
  "hi",
  "pt",
  "zh",
  "he",
  "ar",
];

export function estLangueSupportee(code: string): code is CodeLangue {
  return LANGUES_SUPPORTEES.includes(code as CodeLangue);
}

/** Résout une langue depuis une valeur cookie (usage serveur ou client). */
export function resoudreLangue(valeur?: string | null): CodeLangue {
  return valeur && estLangueSupportee(valeur) ? valeur : LANGUE_DEFAUT;
}

/** Lit la langue depuis localStorage (client uniquement). */
export function obtenirLangueStockee(): CodeLangue {
  if (typeof window === "undefined") return LANGUE_DEFAUT;
  const stocke = localStorage.getItem(CLE_STOCKAGE_LANGUE);
  return resoudreLangue(stocke);
}

/** Écrit le cookie langue (client uniquement). */
export function ecrireCookieLangue(code: CodeLangue) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CLE_STOCKAGE_LANGUE}=${code};path=/;max-age=${maxAge};SameSite=Lax`;
}
