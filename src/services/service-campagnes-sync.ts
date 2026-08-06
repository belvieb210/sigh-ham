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

/** Plus de fallback constants — hydratation vide jusqu'à l'API CMS */
export function obtenirCampagnesPublieesSync(): CampagneAvecStatut[] {
  return [];
}

export function obtenirCampagnesEnVedetteSync(): CampagneAvecStatut[] {
  return [];
}

export function filtrerVedettes(
  campagnes: CampagnePublication[]
): CampagneAvecStatut[] {
  return filtrerCampagnesEnVedette(filtrerCampagnesPubliees(campagnes)).map(
    enrichirAvecStatut
  );
}
