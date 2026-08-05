/** Statut calculé d'une campagne selon ses dates */
export type StatutCampagne = "en_cours" | "a_venir" | "terminee";

/** Catégorie thématique */
export type CategorieCampagne =
  | "depistage"
  | "vaccination"
  | "sensibilisation"
  | "evenement";

/** Type de publication (campagnes, publicités, événements) */
export type TypePublication = "campagne" | "publicite" | "evenement";

export type IdIconeCampagne = "ruban" | "vaccin" | "diabete" | "coeur";

/**
 * Modèle complet d'une campagne / publicité.
 * Ce type sera utilisé par l'API admin lors de la publication.
 */
export interface CampagnePublication {
  id: string;
  slug: string;
  titre: string;
  extrait: string;
  description: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  href: string;
  categorie: CategorieCampagne;
  typePublication: TypePublication;
  /** false = brouillon — n'apparaît pas sur le site public */
  publie: boolean;
  /** Affiché en carrousel vedette */
  misEnAvant: boolean;
  couleurFond: string;
  couleurIllustration: string;
  couleurAccent: string;
  icone: IdIconeCampagne;
  /** Image d'illustration optionnelle (public/images/) */
  imageUrl?: string;
  lieu?: string;
  datePublication: string;
}

/** Format simplifié pour la page d'accueil */
export interface CampagneAccueil {
  id: string;
  titre: string;
  periode: string;
  href: string;
  couleurFond: string;
  couleurIllustration: string;
  couleurAccent: string;
  icone: IdIconeCampagne;
  imageUrl?: string;
}
