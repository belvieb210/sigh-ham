import { CAMPAGNES_PUBLICATIONS } from "@/constants/campagnes";
import {
  calculerStatutCampagne,
  filtrerCampagnesPubliees,
  obtenirCampagnesEnVedette as filtrerCampagnesEnVedette,
} from "@/lib/campagnes-utils";
import type { CampagnePublication, StatutCampagne } from "@/types/campagnes";

/** Enrichit une campagne avec son statut calculé */
export function enrichirAvecStatut(campagne: CampagnePublication) {
  return {
    ...campagne,
    statut: calculerStatutCampagne(campagne.dateDebut, campagne.dateFin),
  };
}

export type CampagneAvecStatut = CampagnePublication & {
  statut: StatutCampagne;
};

/** Campagnes publiées triées — synchrone (SSR-safe) */
export function obtenirCampagnesPublieesSync(): CampagneAvecStatut[] {
  return filtrerCampagnesPubliees(CAMPAGNES_PUBLICATIONS)
    .sort(
      (a, b) =>
        new Date(b.datePublication).getTime() -
        new Date(a.datePublication).getTime()
    )
    .map(enrichirAvecStatut);
}

/** Campagnes vedette — synchrone (SSR-safe) */
export function obtenirCampagnesEnVedetteSync(): CampagneAvecStatut[] {
  return filtrerCampagnesEnVedette(CAMPAGNES_PUBLICATIONS).map(enrichirAvecStatut);
}

/**
 * Service campagnes — couche d'accès aux données.
 * Phase future : remplacer par clientApi.get('/campagnes')
 */
export async function obtenirCampagnesPubliees(): Promise<CampagneAvecStatut[]> {
  return obtenirCampagnesPublieesSync();
}

export async function obtenirCampagnesEnVedette(): Promise<CampagneAvecStatut[]> {
  return obtenirCampagnesEnVedetteSync();
}

export async function obtenirCampagneParSlug(
  slug: string
): Promise<CampagnePublication | null> {
  const campagne = CAMPAGNES_PUBLICATIONS.find(
    (c) => c.slug === slug && c.publie
  );
  return campagne ?? null;
}

export async function obtenirCampagnesAvecStatut(): Promise<CampagneAvecStatut[]> {
  return obtenirCampagnesPublieesSync();
}
