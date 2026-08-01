import type { CodeLangue } from "@/locales/types";

const LOCALES_DATE: Record<CodeLangue, string> = {
  fr: "fr-FR",
  en: "en-US",
  ln: "fr-FR",
  sw: "sw-KE",
  kg: "fr-FR",
  lua: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  hi: "hi-IN",
  pt: "pt-PT",
  zh: "zh-CN",
  he: "he-IL",
  ar: "ar-SA",
};

export function obtenirLocaleDate(code: CodeLangue): string {
  return LOCALES_DATE[code] ?? "fr-FR";
}

export function formaterDateAffichage(
  dateIso: string,
  locale = "fr-FR"
): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (!y || !m || !d) return dateIso;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return dateIso;

  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
