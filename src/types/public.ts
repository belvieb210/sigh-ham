/** Type pour un lien de navigation */
export interface LienNavigation {
  etiquette: string;
  href: string;
}

/** Type pour un service médical */
export interface ServiceMedical {
  id: string;
  titre: string;
  description: string;
  href: string;
  couleurIcone: string;
  fondIcone: string;
  icone: string;
}

/** Type pour une campagne de santé */
export interface CampagneSante {
  id: string;
  titre: string;
  periode: string;
  href: string;
  couleurFond: string;
  couleurAccent: string;
  icone: string;
}

/** Type pour un médecin (affichage public) */
export interface MedecinPublic {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  experience: string;
  biographie: string;
  photoUrl?: string;
  horaires?: string;
}

/** Type pour un article d'actualité */
export interface ArticleActualite {
  id: string;
  titre: string;
  extrait: string;
  datePublication: string;
  imageUrl?: string;
  href: string;
  categorie: string;
}

/** Type pour un témoignage patient */
export interface TemoignagePatient {
  id: string;
  nom: string;
  role: string;
  contenu: string;
  note: number;
}

/** Type pour une offre d'emploi */
export interface OffreEmploi {
  id: string;
  titre: string;
  departement: string;
  typeContrat: string;
  lieu: string;
  datePublication: string;
  href: string;
}
