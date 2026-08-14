"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  enrichirAvecStatut,
  type CampagneAvecStatut,
} from "@/services/service-campagnes-sync";
import { obtenirCampagnesEnVedette as filtrerVedette } from "@/lib/campagnes-utils";
import type { CampagnePublication } from "@/types/campagnes";

async function fetchCampagnesPubliees(): Promise<CampagneAvecStatut[]> {
  const res = await fetch("/api/public/campagnes", { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    campagnes?: (CampagnePublication & { statut?: string })[];
  };
  return (data.campagnes ?? []).map((c) =>
    c.statut ? (c as CampagneAvecStatut) : enrichirAvecStatut(c)
  );
}

const OPTIONS_REQUETE_CAMPAGNES = {
  queryKey: ["campagnes", "publiees"] as const,
  queryFn: fetchCampagnesPubliees,
  initialData: [] as CampagneAvecStatut[],
  staleTime: 0,
  gcTime: 5 * 60_000,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
};

/** Hook — campagnes publiées CMS uniquement (pas de constants statiques) */
export function useCampagnes() {
  return useQuery(OPTIONS_REQUETE_CAMPAGNES);
}

/** Hook — campagnes vedette CMS (même source fraîche que useCampagnes) */
export function useCampagnesVedette() {
  const query = useCampagnes();
  const data = useMemo(
    () => filtrerVedette(query.data ?? []).map((c) =>
      "statut" in c && c.statut
        ? (c as CampagneAvecStatut)
        : enrichirAvecStatut(c)
    ),
    [query.data]
  );
  return { ...query, data };
}
