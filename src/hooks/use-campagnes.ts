"use client";

import { useQuery } from "@tanstack/react-query";
import {
  obtenirCampagnesAvecStatut,
  obtenirCampagnesEnVedetteSync,
  obtenirCampagnesPublieesSync,
} from "@/services/service-campagnes";

/** Données initiales identiques serveur/client — évite l'erreur d'hydratation #418 */
const DONNEES_INITIALES = obtenirCampagnesPublieesSync();
const VEDETTES_INITIALES = obtenirCampagnesEnVedetteSync();

/** Hook — campagnes publiées avec statut calculé */
export function useCampagnes() {
  return useQuery({
    queryKey: ["campagnes", "publiees"],
    queryFn: obtenirCampagnesAvecStatut,
    initialData: DONNEES_INITIALES,
    staleTime: 60_000,
  });
}

/** Hook — campagnes vedette pour le carrousel */
export function useCampagnesVedette() {
  return useQuery({
    queryKey: ["campagnes", "vedette"],
    queryFn: async () => obtenirCampagnesEnVedetteSync(),
    initialData: VEDETTES_INITIALES,
    staleTime: 60_000,
  });
}
