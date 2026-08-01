"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_RECEPTION,
  NAVIGATION_RECEPTION,
} from "@/constants/reception";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationReception() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const principal = useMemo(
    () =>
      NAVIGATION_RECEPTION.principal.map((item) => ({
        ...item,
        etiquette: t(`reception.nav.${item.id}`),
      })),
    [t, langue]
  );

  const parametres = useMemo(
    () =>
      NAVIGATION_RECEPTION.parametres.map((item) => ({
        ...item,
        etiquette: t(`reception.nav.${item.id}`),
      })),
    [t, langue]
  );

  const communication = useMemo(
    () =>
      NAVIGATION_RECEPTION.communication.map((item) => ({
        ...item,
        etiquette: t(`reception.nav.${item.id}`),
      })),
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_RECEPTION.map((item) => ({
        ...item,
        etiquette: t(`reception.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { principal, communication, parametres, basse };
}
