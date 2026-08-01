"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LIENS_NAVIGATION, LIENS_NAVIGATION_MOBILE } from "@/constants/navigation";
import { useLangueActive } from "@/hooks/use-langue-active";

const CLES_NAV: Record<string, string> = {
  "/": "nav.accueil",
  "/a-propos": "nav.aPropos",
  "/services": "nav.services",
  "/campagnes": "nav.campagnes",
  "/contact": "nav.contact",
  "/rendez-vous": "nav.rendezVous",
};

/** Liens de navigation traduits selon la langue active */
export function useLiensNavigation() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const principale = useMemo(
    () =>
      LIENS_NAVIGATION.map((lien) => ({
        ...lien,
        etiquette: t(CLES_NAV[lien.href] ?? lien.etiquette),
      })),
    [t, langue]
  );

  const mobile = useMemo(
    () =>
      LIENS_NAVIGATION_MOBILE.map((lien) => ({
        ...lien,
        etiquette: t(CLES_NAV[lien.href] ?? lien.etiquette),
      })),
    [t, langue]
  );

  return { principale, mobile };
}
