import type { ModePaiement, StatutFacture } from "@/generated/prisma/client";

export type ModeFactureCaisse =
  | "CASH"
  | "AVANCE"
  | "SOLDE"
  | "PRISE_EN_CHARGE"
  | "ABONNE"
  | "CONVENTIONNE";

export type DestinationApresEncaissement = "LABORATOIRE" | "PHARMACIE" | "AUCUNE";

export interface PatientFileCaisse {
  fileAttenteId: string;
  passageId: string;
  transfertId: string;
  dossierId: string;
  numeroPatient: string;
  numeroDossier: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  sexe: string | null;
  dateNaissance: string | null;
  motif: string | null;
  arriveeLe: string;
  numeroOrdre: number;
  nombreExamens: number;
  montantEstime: number;
  factureOuverte: boolean;
}

export interface LigneFacturable {
  id: string;
  libelle: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  source: "EXAMEN" | "FACTURE";
}

export interface FactureCaisseDetail {
  id: string | null;
  numeroFacture: string | null;
  statut: StatutFacture | null;
  montantTotal: number;
  montantPaye: number;
  devise: string;
  lignes: LigneFacturable[];
  historiquePaiements: HistoriquePaiementCaisse[];
}

export interface HistoriquePaiementCaisse {
  id: string;
  montant: number;
  mode: ModePaiement;
  reference: string | null;
  payeLe: string;
  caissier: string;
}

export interface DossierFacturationCaisse {
  dossierId: string;
  numeroPatient: string;
  numeroDossier: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  sexe: string | null;
  dateNaissance: string | null;
  statutAttente: "EN_ATTENTE_PAIEMENT" | "PAYE" | "HORS_FILE";
  fileAttenteId: string | null;
  transfertId: string | null;
  facture: FactureCaisseDetail;
}

export interface StatsCaisseJour {
  patientsEnAttente: number;
  facturesDuJour: number;
  encaissementsDuJour: number;
  montantEncaisseDuJour: number;
}

export interface FactureResumeJour {
  id: string;
  dossierId: string;
  numeroFacture: string;
  statut: StatutFacture;
  montantTotal: number;
  montantPaye: number;
  devise: string;
  emiseLe: string | null;
  patient: string;
  numeroPatient: string;
}

export interface EncaissementResumeJour {
  id: string;
  montant: number;
  mode: ModePaiement;
  reference: string | null;
  payeLe: string;
  numeroFacture: string;
  patient: string;
  caissier: string;
}
