"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_EGLISE,
  NAVIGATION_EGLISE,
} from "@/constants/eglise";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationEglise() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`eglise.nav.${item.id}`),
    }));

  const principal = useMemo(
    () => mapSection(NAVIGATION_EGLISE.principal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const eglise = useMemo(
    () => mapSection(NAVIGATION_EGLISE.eglise),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_EGLISE.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_EGLISE.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_EGLISE.map((item) => ({
        ...item,
        etiquette: t(`eglise.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { principal, eglise, communication, parametres, basse };
}
