export interface TypeExamenReception {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
}

export interface DonneesFormulairePatient {
  numeroPatient: string;
  numeroEnregistrement: string;
  typeVisite: string;
  nom: string;
  prenom: string;
  postNom: string;
  sexe: "MASCULIN" | "FEMININ";
  dateNaissance: string;
  telephone: string;
  telephoneSecondaire: string;
  email: string;
  etatCivil: string;
  adresse: string;
  commune: string;
  ville: string;
  pays: string;
  contactUrgence: string;
  telephoneUrgence: string;
  profession: string;
  employeur: string;
  groupeSanguin: string;
  assurance: string;
  numeroAssurance: string;
  numeroPieceIdentite: string;
  observations: string;
  /** Date d'enregistrement formatée (fr-FR) */
  dateEnregistrement: string;
  /** Heure d'enregistrement formatée (fr-FR) */
  heureEnregistrement: string;
  /** URL publique de la photo patient */
  photoUrl: string | null;
  /** Dossier de visite en cours (réutilisé au transfert) */
  dossierId?: string;
}

export interface DonneesEnregistrementPatient {
  typeVisite: string;
  nom: string;
  prenom: string;
  postNom?: string;
  sexe: "MASCULIN" | "FEMININ";
  dateNaissance: string;
  telephone?: string;
  telephoneSecondaire?: string;
  email?: string;
  etatCivil?: string;
  adresse?: string;
  commune?: string;
  ville?: string;
  pays?: string;
  contactUrgence?: string;
  telephoneUrgence?: string;
  profession?: string;
  employeur?: string;
  groupeSanguin?: string;
  assurance?: string;
  numeroAssurance?: string;
  numeroPieceIdentite?: string;
  observations?: string;
}

export interface ResultatEnregistrementPatient {
  patientId: string;
  dossierId: string;
  numeroPatient: string;
  numeroEnregistrement: string;
}

export interface DonneesTransfertAccueil extends DonneesEnregistrementPatient {
  numeroPatient?: string;
  dossierId?: string;
  orientation: string;
  motifPrincipal?: string;
  motifAutreTexte?: string;
  descriptionMotif?: string;
  examensIds?: string[];
  transfertManuel?: boolean;
}

export interface ResultatTransfertAccueil {
  transfertId: string;
  patientId: string;
  dossierId: string;
  numeroPatient: string;
  numeroEnregistrement: string;
  salleDestination: string;
  examensPrescrits: number;
  /** Transfert EN_ATTENTE existant mis à jour (transfert manuel) */
  transfertMisAJour?: boolean;
}

export interface ResultatRecherchePatientReception {
  numeroPatient: string;
  nomComplet: string;
  telephone: string;
  dossierId?: string;
}
