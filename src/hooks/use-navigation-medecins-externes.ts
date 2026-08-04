"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  NAVIGATION_BASSE_MEDECINS_EXTERNES,
  NAVIGATION_MEDECINS_EXTERNES,
} from "@/constants/medecins-externes";
import { useLangueActive } from "@/hooks/use-langue-active";

export function useNavigationMedecinsExternes() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const mapSection = <T extends { id: string }>(items: readonly T[]) =>
    items.map((item) => ({
      ...item,
      etiquette: t(`medecinsExternes.nav.${item.id}`),
    }));

  const tableauDeBord = useMemo(
    () => mapSection(NAVIGATION_MEDECINS_EXTERNES.tableauDeBord),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const clinique = useMemo(
    () => mapSection(NAVIGATION_MEDECINS_EXTERNES.clinique),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const communication = useMemo(
    () => mapSection(NAVIGATION_MEDECINS_EXTERNES.communication),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );
  const parametres = useMemo(
    () => mapSection(NAVIGATION_MEDECINS_EXTERNES.parametres),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, langue]
  );

  const basse = useMemo(
    () =>
      NAVIGATION_BASSE_MEDECINS_EXTERNES.map((item) => ({
        ...item,
        etiquette: t(`medecinsExternes.navBas.${item.id}`),
      })),
    [t, langue]
  );

  return { tableauDeBord, clinique, communication, parametres, basse };
}
