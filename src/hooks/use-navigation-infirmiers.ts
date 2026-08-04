"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_INFIRMIERS,
  NAVIGATION_INFIRMIERS,
} from "@/constants/infirmiers";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationInfirmiers() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`infirmiers.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_INFIRMIERS.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const infirmiers = useMemo(
    () => mapSection(NAVIGATION_INFIRMIERS.infirmiers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_INFIRMIERS.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_INFIRMIERS.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_INFIRMIERS.map((item) => ({
        ...item,
        etiquette: t(`infirmiers.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { tableauDeBord, infirmiers, communication, parametres, basse };
}
