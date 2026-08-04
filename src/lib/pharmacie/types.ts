export interface PatientFilePharmacie {
  cleListe: string;
  dossierId: string;
  passageId: string;
  numeroPatient: string;
  numeroDossier: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  motif: string;
  provenance: string;
  orientation: string;
  orientationCouleur: string;
  codeSalleDestination: string;
  codesSalleDestination?: string[];
  statut: string;
  statutCouleur: string;
  heure: string;
  arriveeLe: string;
  transfertId: string | null;
  transfertSortantId: string | null;
  statutTransfertSortant: string | null;
  enRecuperation: boolean;
  numeroOrdre: number;
}

export interface StatsPharmacieJour {
  patientsEnFile: number;
  ordonnancesEnAttente: number;
  ventesDuJour: number;
  chiffreAffairesJour: number;
  stockFaible: number;
  lotsExpirantBientot: number;
  arriveesFileIso: string[];
  dateReference: string;
}

export interface MedicamentResume {
  id: string;
  code: string;
  nom: string;
  forme: string | null;
  dosage: string | null;
  prixUnitaire: number;
  stockDisponible: number;
  actif: boolean;
}

export interface OrdonnanceInbox {
  id: string;
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
  medecin: string;
  prescritLe: string;
  statut: string;
  notes: string | null;
  lignes: {
    id: string;
    medicamentId: string;
    medicamentNom: string;
    quantite: number;
    posologie: string | null;
    prixUnitaire: number;
    stockDisponible: number;
  }[];
}

export interface VenteResume {
  id: string;
  numero: string;
  dossierId: string;
  nomComplet: string;
  type: string;
  statut: string;
  montantTotal: number;
  creeLe: string;
  factureId: string | null;
  ordonnanceId: string | null;
}

export interface LotResume {
  id: string;
  numeroLot: string;
  medicamentId: string;
  medicamentNom: string;
  quantite: number;
  expirationLe: string;
  fournisseur: string | null;
}

export interface FournisseurResume {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  actif: boolean;
}
