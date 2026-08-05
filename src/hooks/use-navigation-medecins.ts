"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_MEDECINS,
  NAVIGATION_MEDECINS,
} from "@/constants/medecins";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationMedecins() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`medecins.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_MEDECINS.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const salle = useMemo(
    () => mapSection(NAVIGATION_MEDECINS.salle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_MEDECINS.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_MEDECINS.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_MEDECINS.map((item) => ({
        ...item,
        etiquette: t(`medecins.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { tableauDeBord, salle, communication, parametres, basse };
}
