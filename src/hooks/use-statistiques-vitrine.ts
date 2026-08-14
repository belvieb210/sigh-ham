"use client";

import { useQuery } from "@tanstack/react-query";
import type { StatistiquesVitrine } from "@/lib/client/statistiques-vitrine-utils";

const VIDE: StatistiquesVitrine = {
  patientsTotal: 0,
  patientsAnnee: 0,
  medecinsVitrine: 0,
  professionnels: 0,
  servicesVitrine: 0,
  typesAnalyses: 0,
  examensTermines: 0,
  campagnesPubliees: 0,
  campagnesAnnee: 0,
  campagnesDepistage: 0,
  campagnesVaccination: 0,
  partenaires: 0,
  communesCampagnes: 0,
  demandesRdv: 0,
  certification: "ISO 9001:2015",
};

export function useStatistiquesVitrine() {
  return useQuery({
    queryKey: ["public", "statistiques-vitrine"],
    queryFn: async () => {
      const res = await fetch("/api/public/statistiques-vitrine");
      if (!res.ok) return VIDE;
      const json = (await res.json()) as { statistiques?: StatistiquesVitrine };
      return json.statistiques ?? VIDE;
    },
    staleTime: 60_000,
  });
}
