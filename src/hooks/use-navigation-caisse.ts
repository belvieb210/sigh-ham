"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_CAISSE,
  NAVIGATION_CAISSE,
} from "@/constants/caisse";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationCaisse() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const principal = useMemo(
    () =>
      NAVIGATION_CAISSE.principal.map((item) => ({
        ...item,
        etiquette: t(`caisse.nav.${item.id}`),
      })),
    [t, langue]
  );

  const parametres = useMemo(
    () =>
      NAVIGATION_CAISSE.parametres.map((item) => ({
        ...item,
        etiquette: t(`caisse.nav.${item.id}`),
      })),
    [t, langue]
  );

  const communication = useMemo(
    () =>
      NAVIGATION_CAISSE.communication.map((item) => ({
        ...item,
        etiquette: t(`caisse.nav.${item.id}`),
      })),
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_CAISSE.map((item) => ({
        ...item,
        etiquette: t(`caisse.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { principal, communication, parametres, basse };
}
