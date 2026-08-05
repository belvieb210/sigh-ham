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

/** Campagnes publiées triées — synchrone (fallback constants) */
export function obtenirCampagnesPublieesSync(): CampagneAvecStatut[] {
  return filtrerCampagnesPubliees(CAMPAGNES_PUBLICATIONS)
    .sort(
      (a, b) =>
        new Date(b.datePublication).getTime() -
        new Date(a.datePublication).getTime()
    )
    .map(enrichirAvecStatut);
}

/** Campagnes vedette — synchrone (fallback constants) */
export function obtenirCampagnesEnVedetteSync(): CampagneAvecStatut[] {
  return filtrerCampagnesEnVedette(CAMPAGNES_PUBLICATIONS).map(
    enrichirAvecStatut
  );
}
