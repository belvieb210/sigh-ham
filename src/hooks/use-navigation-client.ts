"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_CLIENT,
  NAVIGATION_BASSE_CLIENT,
} from "@/constants/client";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationClient() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`client.nav.${item.id}`),
    }));

  const principal = useMemo(
    () => mapSection(NAVIGATION_CLIENT.principal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const contenu = useMemo(
    () => mapSection(NAVIGATION_CLIENT.contenu),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_CLIENT.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const compte = useMemo(
    () => mapSection(NAVIGATION_CLIENT.compte),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_CLIENT.map((item) => ({
        ...item,
        etiquette: t(`client.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { principal, contenu, communication, compte, basse };
}
