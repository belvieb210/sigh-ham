"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_ADMIN,
  NAVIGATION_BASSE_ADMIN,
} from "@/constants/admin";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationAdmin() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`admin.nav.${item.id}`),
    }));

  const principal = useMemo(
    () => mapSection(NAVIGATION_ADMIN.principal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const gouvernance = useMemo(
    () => mapSection(NAVIGATION_ADMIN.gouvernance),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const referentiels = useMemo(
    () => mapSection(NAVIGATION_ADMIN.referentiels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const systeme = useMemo(
    () => mapSection(NAVIGATION_ADMIN.systeme),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_ADMIN.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const compte = useMemo(
    () => mapSection(NAVIGATION_ADMIN.compte),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_ADMIN.map((item) => ({
        ...item,
        etiquette: t(`admin.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return {
    principal,
    gouvernance,
    referentiels,
    systeme,
    communication,
    compte,
    basse,
  };
}
