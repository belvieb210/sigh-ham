import "server-only";
import {
  chargerCampagneParSlug,
  chargerCampagnesPubliques,
} from "@/lib/client/contenu-public";
import {
  enrichirAvecStatut,
  type CampagneAvecStatut,
} from "@/services/service-campagnes-sync";
import { obtenirCampagnesEnVedette as filtrerCampagnesEnVedette } from "@/lib/campagnes-utils";
import type { CampagnePublication } from "@/types/campagnes";

export type { CampagneAvecStatut };

export async function obtenirCampagnesPubliees(): Promise<CampagneAvecStatut[]> {
  const campagnes = await chargerCampagnesPubliques({ seulementPubliees: true });
  return campagnes
    .sort(
      (a, b) =>
        new Date(b.datePublication).getTime() -
        new Date(a.datePublication).getTime()
    )
    .map(enrichirAvecStatut);
}

export async function obtenirCampagnesEnVedette(): Promise<CampagneAvecStatut[]> {
  const campagnes = await chargerCampagnesPubliques({ seulementPubliees: true });
  return filtrerCampagnesEnVedette(campagnes).map(enrichirAvecStatut);
}

export async function obtenirCampagneParSlug(
  slug: string
): Promise<CampagnePublication | null> {
  return chargerCampagneParSlug(slug);
}

export async function obtenirCampagnesAvecStatut(): Promise<CampagneAvecStatut[]> {
  return obtenirCampagnesPubliees();
}
