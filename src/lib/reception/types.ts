import type { CodeSalle } from "@/generated/prisma/client";

export interface TypeExamenReception {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
}

export interface PaquetBilanReception {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  prix: number;
  examens: TypeExamenReception[];
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
  /** Dossier de visite réutilisable (accueil, transfert non confirmé) */
  dossierId?: string;
  /** N° de la dernière / visite en cours (VIS-… ou ancien format) */
  numeroVisite?: string;
  visiteReutilisable?: boolean;
  visiteStatut?: string;
  salleEnCoursNom?: string | null;
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
  paquetsBilanIds?: string[];
  medecinResponsable?: string;
  estEstimation?: boolean;
  /** Remise en devise (USD), ≥ 0 */
  remise?: number;
  transfertManuel?: boolean;
}

export interface ResultatTransfertAccueil {
  transfertId: string;
  patientId: string;
  dossierId: string;
  numeroPatient: string;
  numeroEnregistrement: string;
  salleDestination: string;
  codeSalleDestination?: CodeSalle;
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
