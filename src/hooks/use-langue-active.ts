"use client";

import { useTranslation } from "react-i18next";
import { estLangueSupportee } from "@/lib/i18n-config";
import type { CodeLangue } from "@/locales/types";

/**
 * Langue i18n effective (résolue).
 * À inclure dans les deps de useMemo / useCallback des hooks traduits
 * pour recalculer les libellés à chaque changement de langue.
 */
export function useLangueActive(): CodeLangue {
  const { i18n } = useTranslation();
  const code = i18n.resolvedLanguage ?? i18n.language;
  return (estLangueSupportee(code) ? code : "fr") as CodeLangue;
}
