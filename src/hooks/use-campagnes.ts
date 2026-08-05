"use client";

import { useQuery } from "@tanstack/react-query";
import {
  obtenirCampagnesEnVedetteSync,
  obtenirCampagnesPublieesSync,
  enrichirAvecStatut,
  type CampagneAvecStatut,
} from "@/services/service-campagnes-sync";
import { obtenirCampagnesEnVedette as filtrerVedette } from "@/lib/campagnes-utils";
import type { CampagnePublication } from "@/types/campagnes";

/** Données initiales identiques serveur/client — évite l'erreur d'hydratation #418 */
const DONNEES_INITIALES = obtenirCampagnesPublieesSync();
const VEDETTES_INITIALES = obtenirCampagnesEnVedetteSync();

async function fetchCampagnesPubliees(): Promise<CampagneAvecStatut[]> {
  try {
    const res = await fetch("/api/public/campagnes");
    if (!res.ok) return DONNEES_INITIALES;
    const data = (await res.json()) as {
      campagnes?: (CampagnePublication & { statut?: string })[];
    };
    if (!data.campagnes?.length) return DONNEES_INITIALES;
    return data.campagnes.map((c) =>
      c.statut ? (c as CampagneAvecStatut) : enrichirAvecStatut(c)
    );
  } catch {
    return DONNEES_INITIALES;
  }
}

async function fetchCampagnesVedette(): Promise<CampagneAvecStatut[]> {
  const toutes = await fetchCampagnesPubliees();
  return filtrerVedette(toutes).map((c) =>
    "statut" in c && c.statut
      ? (c as CampagneAvecStatut)
      : enrichirAvecStatut(c)
  );
}

/** Hook — campagnes publiées avec statut calculé (API publique / DB) */
export function useCampagnes() {
  return useQuery({
    queryKey: ["campagnes", "publiees"],
    queryFn: fetchCampagnesPubliees,
    initialData: DONNEES_INITIALES,
    staleTime: 60_000,
  });
}

/** Hook — campagnes vedette pour le carrousel */
export function useCampagnesVedette() {
  return useQuery({
    queryKey: ["campagnes", "vedette"],
    queryFn: fetchCampagnesVedette,
    initialData: VEDETTES_INITIALES,
    staleTime: 60_000,
  });
}
