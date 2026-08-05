import type { CampagneAccueil, CampagnePublication, CategorieCampagne, StatutCampagne } from "@/types/campagnes";

/** Calcule le statut d'une campagne à partir de ses dates */
export function calculerStatutCampagne(
  dateDebut: string,
  dateFin: string,
  reference: Date = new Date()
): StatutCampagne {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  fin.setHours(23, 59, 59, 999);

  if (reference < debut) return "a_venir";
  if (reference > fin) return "terminee";
  return "en_cours";
}

/** Filtre les campagnes publiées (visibles sur le site public) */
export function filtrerCampagnesPubliees(
  campagnes: CampagnePublication[]
): CampagnePublication[] {
  return campagnes.filter((c) => c.publie);
}

/** Campagnes mises en avant pour le carrousel */
export function obtenirCampagnesEnVedette(
  campagnes: CampagnePublication[]
): CampagnePublication[] {
  return filtrerCampagnesPubliees(campagnes).filter((c) => c.misEnAvant);
}

/** Convertit vers le format page d'accueil (campagnes en cours prioritaires) */
export function versFormatAccueil(
  campagnes: CampagnePublication[]
): CampagneAccueil[] {
  return filtrerCampagnesPubliees(campagnes)
    .sort((a, b) => {
      const statutA = calculerStatutCampagne(a.dateDebut, a.dateFin);
      const statutB = calculerStatutCampagne(b.dateDebut, b.dateFin);
      const priorite = { en_cours: 0, a_venir: 1, terminee: 2 };
      return priorite[statutA] - priorite[statutB];
    })
    .slice(0, 4)
    .map(
      ({
        id,
        titre,
        periode,
        href,
        couleurFond,
        couleurIllustration,
        couleurAccent,
        icone,
        imageUrl,
      }) => ({
        id,
        titre,
        periode,
        href,
        couleurFond,
        couleurIllustration,
        couleurAccent,
        icone,
        imageUrl,
      })
    );
}

export const LIBELLES_STATUT: Record<StatutCampagne, string> = {
  en_cours: "En cours",
  a_venir: "À venir",
  terminee: "Terminée",
};

export const LIBELLES_CATEGORIE: Record<CategorieCampagne, string> = {
  depistage: "Dépistage",
  vaccination: "Vaccination",
  sensibilisation: "Sensibilisation",
  evenement: "Événement",
};