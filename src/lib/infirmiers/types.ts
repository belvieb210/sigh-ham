export interface PatientFileInfirmiers {
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
  hasConstantesAujourdhui: boolean;
}

export interface StatsInfirmiersJour {
  patientsEnFile: number;
  constantesAujourdhui: number;
  transfertsSortantsAujourdhui: number;
  fichesTraitementActives: number;
  patientsConsultationEnAttente: number;
  arriveesFileIso: string[];
  dateReference: string;
}

export type ActiviteRecenteInfirmiers = {
  id: string;
  type: "CONSTANTES" | "TRANSFERT" | "FICHE_TRAITEMENT";
  libelle: string;
  patient: string;
  heure: string;
  iso: string;
};

export type ApercuDashboardInfirmiers = {
  stats: StatsInfirmiersJour;
  file: PatientFileInfirmiers[];
  patientEnCours: DetailPatientInfirmiers | null;
  activites: ActiviteRecenteInfirmiers[];
};

export interface ConstanteVitaleResume {
  id: string;
  temperature: number | null;
  tensionSystolique: number | null;
  tensionDiastolique: number | null;
  frequenceCardiaque: number | null;
  frequenceRespiratoire: number | null;
  poidsKg: number | null;
  tailleCm: number | null;
  saturationO2: number | null;
  glycemie: number | null;
  observations: string | null;
  mesureLe: string;
  infirmier?: string;
  formulaireClinique?: import("@/lib/medecins/types").FormulaireCliniqueMedecins | null;
}

export interface DetailPatientInfirmiers extends PatientFileInfirmiers {
  constantesVitales: ConstanteVitaleResume[];
  derniereConstante: ConstanteVitaleResume | null;
}

export interface HistoriqueConstanteInfirmiers extends ConstanteVitaleResume {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
}

export interface PatientHistoriqueInfirmiers {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  derniereMesureLe: string;
  nbConsultations: number;
  derniereConstante: ConstanteVitaleResume | null;
}

export interface HistoriqueCompletDossierInfirmiers {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  constantes: ConstanteVitaleResume[];
  nbFichesTraitement: number;
}
