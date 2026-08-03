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
  numeroRecu: string;
  montant: number;
  mode: ModePaiement;
  typeFacture: string | null;
  reference: string | null;
  payeLe: string;
  caissier: string;
  statut: "PAYE" | "PARTIEL";
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
  recuLe: string | null;
  transferePar: string | null;
  /** Remise proposée à la réception (préremplit la facturation) */
  remiseProposee: number;
  facture: FactureCaisseDetail;
}

export interface StatsCaisseJour {
  patientsEnAttente: number;
  facturesDuJour: number;
  encaissementsDuJour: number;
  montantEncaisseDuJour: number;
}

export type StatutFactureAffiche = "PAYEE" | "PARTIELLE" | "IMPAYEE";

export interface KpiNombreMontant {
  count: number;
  montantTotal: number;
  variationPct: number | null;
}

export interface KpiMontantSeul {
  montant: number;
  variationPct: number | null;
}

export interface PointEvolutionEncaissement {
  /** YYYY-MM-DD */
  date: string;
  label: string;
  montant: number;
}

export interface FactureAccueilResume {
  id: string;
  dossierId: string;
  numeroFacture: string;
  patient: string;
  examens: string;
  montantTotal: number;
  devise: string;
  statut: StatutFacture;
  statutAffiche: StatutFactureAffiche;
}

export interface PatientAttenteAccueil {
  dossierId: string;
  patient: string;
  service: string;
  examensDemandes: string;
  minutesAttente: number;
  tempsAttenteLabel: string;
}

export interface PatientTransfertCaisse {
  cleListe: string;
  dossierId: string;
  numeroPatient: string;
  numeroDossier: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  telephone: string;
  motif: string;
  orientation: string;
  orientationCouleur: string;
  codeSalleDestination: string;
  statut: string;
  statutCouleur: string;
  heure: string;
  arriveeLe: string;
  transfertId: string | null;
  passageId: string;
  numeroOrdre: number;
  nombreExamens: number;
  montantEstime: number;
  dateNaissance: string | null;
  factureOuverte: boolean;
}

export interface StatsTransfertsCaisse {
  enAttente: number;
  enCours: number;
  transferesAujourdhui: number;
  versLaboratoire: number;
}

export interface TableauDeBordAccueilCaisse extends StatsCaisseJour {
  dateReference: string;
  kpis: {
    facturesDuJour: KpiNombreMontant;
    paiementsDuJour: KpiNombreMontant;
    montantEncaisse: KpiMontantSeul;
    patientsEnAttente: { count: number };
    facturesImpayees: { count: number; montantTotal: number };
  };
  dernieresFactures: FactureAccueilResume[];
  evolutionEncaissements: PointEvolutionEncaissement[];
  patientsAttente: PatientAttenteAccueil[];
  dernierPaiementId: string | null;
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
