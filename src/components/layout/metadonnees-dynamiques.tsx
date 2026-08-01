"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { estLangueSupportee } from "@/lib/i18n-config";
import type { CodeLangue } from "@/locales/types";

const CLE_META_PAR_ROUTE: Record<string, string> = {
  "/": "meta.accueil",
  "/contact": "meta.contact",
  "/services": "meta.services",
  "/campagnes": "meta.campagnes",
  "/rendez-vous": "meta.rendezVous",
  "/a-propos": "meta.aPropos",
  "/connexion": "meta.connexion",
  "/connexion/mot-de-passe-oublie": "meta.reinitialisationMotDePasse",
  "/application": "meta.application",
};

function mettreAJourMeta(nom: string, contenu: string) {
  let element = document.querySelector(`meta[name="${nom}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", nom);
    document.head.appendChild(element);
  }
  element.setAttribute("content", contenu);
}

export function MetadonneesDynamiques() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const langue = (
    estLangueSupportee(i18n.language) ? i18n.language : "fr"
  ) as CodeLangue;

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  useEffect(() => {
    const cleBase =
      pathname.startsWith("/campagnes/") && pathname !== "/campagnes"
        ? null
        : CLE_META_PAR_ROUTE[pathname];

    const site = t("meta.site");
    let titre: string;
    let description: string;

    if (cleBase) {
      titre = t(`${cleBase}.title`);
      description = t(`${cleBase}.description`);
    } else if (pathname.startsWith("/campagnes/")) {
      titre = document.title.split(" | ")[0] || t("meta.campagnes.title");
      description = t("meta.campagnes.description");
    } else {
      titre = t("meta.defaultTitle");
      description = t("meta.defaultDescription");
    }

    document.title =
      pathname === "/" ? t("meta.defaultTitle") : `${titre} | ${site}`;

    mettreAJourMeta("description", description);
  }, [pathname, t, i18n.language]);

  return null;
}
