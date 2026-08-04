"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_PHARMACIE,
  NAVIGATION_PHARMACIE,
} from "@/constants/pharmacie";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationPharmacie() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`pharmacie.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_PHARMACIE.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const pharmacie = useMemo(
    () => mapSection(NAVIGATION_PHARMACIE.pharmacie),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_PHARMACIE.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_PHARMACIE.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_PHARMACIE.map((item) => ({
        ...item,
        etiquette: t(`pharmacie.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { tableauDeBord, pharmacie, communication, parametres, basse };
}
