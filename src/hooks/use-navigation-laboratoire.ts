"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_LABORATOIRE,
  NAVIGATION_LABORATOIRE,
} from "@/constants/laboratoire";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationLaboratoire() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`laboratoire.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_LABORATOIRE.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const laboratoire = useMemo(
    () => mapSection(NAVIGATION_LABORATOIRE.laboratoire),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const rapports = useMemo(
    () => mapSection(NAVIGATION_LABORATOIRE.rapports),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_LABORATOIRE.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_LABORATOIRE.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_LABORATOIRE.map((item) => ({
        ...item,
        etiquette: t(`laboratoire.navBas.${item.id}`),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  return {
    tableauDeBord,
    laboratoire,
    rapports,
    communication,
    parametres,
    basse,
  };
}
