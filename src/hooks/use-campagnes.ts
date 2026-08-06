"use client";

import { useQuery } from "@tanstack/react-query";
import {
  enrichirAvecStatut,
  type CampagneAvecStatut,
} from "@/services/service-campagnes-sync";
import { obtenirCampagnesEnVedette as filtrerVedette } from "@/lib/campagnes-utils";
import type { CampagnePublication } from "@/types/campagnes";

async function fetchCampagnesPubliees(): Promise<CampagneAvecStatut[]> {
  const res = await fetch("/api/public/campagnes");
  if (!res.ok) return [];
  const data = (await res.json()) as {
    campagnes?: (CampagnePublication & { statut?: string })[];
  };
  return (data.campagnes ?? []).map((c) =>
    c.statut ? (c as CampagneAvecStatut) : enrichirAvecStatut(c)
  );
}

async function fetchCampagnesVedette(): Promise<CampagneAvecStatut[]> {
  const toutes = await fetchCampagnesPubliees();
  return filtrerVedette(toutes).map((c) =>
    "statut" in c && c.statut
      ? (c as CampagneAvecStatut)
      : enrichirAvecStatut(c)
  );
}

/** Hook — campagnes publiées CMS uniquement (pas de constants statiques) */
export function useCampagnes() {
  return useQuery({
    queryKey: ["campagnes", "publiees"],
    queryFn: fetchCampagnesPubliees,
    initialData: [],
    staleTime: 60_000,
  });
}

/** Hook — campagnes vedette CMS */
export function useCampagnesVedette() {
  return useQuery({
    queryKey: ["campagnes", "vedette"],
    queryFn: fetchCampagnesVedette,
    initialData: [],
    staleTime: 60_000,
  });
}
