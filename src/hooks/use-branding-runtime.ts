"use client";

import { useEffect, useState } from "react";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";

export interface BrandingRuntime {
  nom: string;
  nomCourt: string;
  nomComplet: string;
  slogan: string;
  telephone: string;
  email: string;
  adresse: string;
}

const FALLBACK: BrandingRuntime = {
  nom: INFORMATIONS_HOPITAL.nom,
  nomCourt: INFORMATIONS_HOPITAL.nomCourt,
  nomComplet: INFORMATIONS_HOPITAL.nomComplet,
  slogan: INFORMATIONS_HOPITAL.slogan,
  telephone: INFORMATIONS_HOPITAL.telephone,
  email: INFORMATIONS_HOPITAL.email,
  adresse: INFORMATIONS_HOPITAL.adresseCourte,
};

export function useBrandingRuntime(): BrandingRuntime {
  const [branding, setBranding] = useState<BrandingRuntime>(FALLBACK);

  useEffect(() => {
    let annule = false;
    fetch("/api/public/branding")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ branding?: BrandingRuntime }>;
      })
      .then((data) => {
        if (!annule && data?.branding) setBranding(data.branding);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      annule = true;
    };
  }, []);

  return branding;
}
