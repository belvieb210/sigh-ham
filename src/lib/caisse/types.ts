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
  /** Statut facture si établie */
  statutFacture: StatutFacture | null;
  montantFacture: number;
  montantPaye: number;
  resteAPayer: number;
  modeFacture: string | null;
  /** Salle / service d'origine du transfert */
  provenance: string;
  medecinResponsable: string | null;
}

export type TypeFactureCaisseUi = "NORMALE" | "PHARMACIE";

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
  /** True si une facture d'avance a déjà été encaissée pour ces examens */
  aUneAvance: boolean;
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
  /** Types d'examen déjà prescrits (non annulés) — pour éviter les doublons à l'ajout */
  idsTypesExamen: string[];
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
  codesSalleDestination?: string[];
  statut: string;
  statutCouleur: string;
  heure: string;
  arriveeLe: string;
  /** Transfert entrant vers la caisse (file) */
  transfertId: string | null;
  /** Transfert sortant créé par orientation rapide caisse */
  transfertSortantId: string | null;
  statutTransfertSortant: string | null;
  enRecuperation: boolean;
  passageId: string;
  numeroOrdre: number;
  nombreExamens: number;
  montantEstime: number;
  dateNaissance: string | null;
  factureOuverte: boolean;
  provenance: string;
  medecinResponsable: string | null;
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

export interface LigneFactureResume {
  libelle: string;
  montant: number;
  quantite: number;
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
  prenom: string;
  nom: string;
  numeroPatient: string;
  numeroDossier: string;
  telephone: string | null;
  dateNaissance: string | null;
  sexe: string | null;
  nombreExamens: number;
  nombreLignes: number;
  modePaiement: ModePaiement | null;
  modeFacture: string | null;
  lignes: LigneFactureResume[];
  /** Jeton signé pour le QR / page publique `/r/[token]` (lié à cette facture). */
  tokenRecu: string;
  /** Facture validée en caisse — autorise les codes-barres tubes */
  approuvee: boolean;
  approuveeLe: string | null;
}

/** Étiquette tube labo (code-barres) */
export interface EtiquetteTubeLabo {
  codeBarre: string;
  ligneDateTube: string;
  nomPatient: string;
  ligneIdentite: string;
  ligneDepartement: string;
  typeTube: string;
  departement: string;
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

export interface SessionCaisseActive {
  id: string;
  caissierId: string;
  numeroCaisse: string;
  soldeOuverture: number;
  ouverteLe: string;
  caissierNom: string;
}

export type PeriodeRapportCaisse = "journalier" | "mensuel" | "plage";

export interface FiltresRapportCaisse {
  periode: PeriodeRapportCaisse;
  /** YYYY-MM-DD — journalier */
  date?: string;
  /** YYYY-MM — mensuel */
  mois?: string;
  /** YYYY-MM-DD — plage */
  dateDu?: string;
  /** YYYY-MM-DD — plage */
  dateAu?: string;
  mode?: ModePaiement | "";
  caissierId?: string;
  q?: string;
}

export interface RepartitionModeRapport {
  mode: ModePaiement;
  count: number;
  montant: number;
  partPct: number;
}

export interface CaissierRapportResume {
  caissierId: string;
  nom: string;
  count: number;
  montant: number;
}

export interface LigneLedgerRapport {
  id: string;
  payeLe: string;
  numeroFacture: string;
  dossierId: string;
  patient: string;
  mode: ModePaiement;
  caissier: string;
  caissierId: string;
  montant: number;
  devise: string;
}

export interface FactureOuverteRapport {
  id: string;
  dossierId: string;
  numeroFacture: string;
  patient: string;
  statut: StatutFacture;
  montantTotal: number;
  montantPaye: number;
  reste: number;
  devise: string;
  emiseLe: string | null;
}

export interface PointSerieRapport {
  cle: string;
  label: string;
  montant: number;
}

export interface AgregatsRapportCaisse {
  facturesCount: number;
  facturesMontant: number;
  encaissementsCount: number;
  encaissementsMontant: number;
  resteDu: number;
  facturesOuvertesCount: number;
}

export interface ComparaisonRapportCaisse {
  labelPrecedent: string;
  encaissementsMontantPrecedent: number;
  variationPct: number | null;
}

export interface OptionCaissierRapport {
  id: string;
  nom: string;
}

export interface RapportCaissePayload {
  periode: PeriodeRapportCaisse;
  debut: string;
  fin: string;
  labelPeriode: string;
  devise: string;
  agregats: AgregatsRapportCaisse;
  comparaison: ComparaisonRapportCaisse;
  repartitionModes: RepartitionModeRapport[];
  caissiers: CaissierRapportResume[];
  serie: PointSerieRapport[];
  ledger: LigneLedgerRapport[];
  facturesOuvertes: FactureOuverteRapport[];
  optionsCaissiers: OptionCaissierRapport[];
}

export type TypeMouvementAvoir = "AVANCE" | "SOLDE" | "OUVERT";

export interface LigneAvoirAvance {
  id: string;
  type: TypeMouvementAvoir;
  payeLe: string | null;
  emiseLe: string | null;
  numeroFacture: string;
  dossierId: string;
  patient: string;
  mode: ModePaiement | null;
  modeFacture: string | null;
  caissier: string | null;
  montant: number;
  montantTotal: number;
  montantPaye: number;
  reste: number;
  devise: string;
  statutFacture: StatutFacture;
}

export interface AgregatsAvoirsCaisse {
  avancesCount: number;
  avancesMontant: number;
  soldesCount: number;
  soldesMontant: number;
  ouvertesCount: number;
  resteDu: number;
}

export interface RapportAvoirsPayload {
  debut: string;
  fin: string;
  labelPeriode: string;
  devise: string;
  agregats: AgregatsAvoirsCaisse;
  ledger: LigneAvoirAvance[];
  optionsCaissiers: OptionCaissierRapport[];
}
