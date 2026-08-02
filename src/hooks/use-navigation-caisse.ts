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

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`caisse.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_CAISSE.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const caisse = useMemo(
    () => mapSection(NAVIGATION_CAISSE.caisse),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const rapports = useMemo(
    () => mapSection(NAVIGATION_CAISSE.rapports),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_CAISSE.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_CAISSE.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return { tableauDeBord, caisse, rapports, communication, parametres, basse };
}
