export interface PatientFileMedecins {
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
  /** Transfert entrant confirmé vers MEDECINS */
  transfertId: string | null;
  transfertSortantId: string | null;
  statutTransfertSortant: string | null;
  enRecuperation: boolean;
  numeroOrdre: number;
  consultationOuverteId: string | null;
}

export interface StatsMedecinsJour {
  patientsEnFile: number;
  consultationsAujourdhui: number;
  ordonnancesAujourdhui: number;
  examensAujourdhui: number;
  patientsTransferesCaisse: number;
  admissionsActives: number;
  arriveesFileIso: string[];
  dateReference: string;
}

export type ActiviteRecenteMedecins = {
  id: string;
  type: "ORDONNANCE" | "EXAMEN" | "NOTE" | "TRANSFERT_CAISSE";
  libelle: string;
  patient: string;
  heure: string;
  iso: string;
};

export type ApercuDashboardMedecins = {
  stats: StatsMedecinsJour;
  file: PatientFileMedecins[];
  consultationEnCours: DetailPatientMedecins | null;
  diagnosticsEnCours: DiagnosticConsultationMedecins[];
  activites: ActiviteRecenteMedecins[];
};

export type PatientTransfereCaisse = {
  id: string;
  dossierId: string;
  nomComplet: string;
  numeroDossier: string;
  telephone: string;
  statut: string;
  destination: string;
  emisLe: string;
  heure: string;
};

export type PatientDuJour = {
  dossierId: string;
  consultationId: string | null;
  nomComplet: string;
  numeroDossier: string;
  telephone: string;
  motif: string;
  debutLe: string;
  finLe: string | null;
  medecin: string;
};

export type NoteMedicaleResume = {
  id: string;
  dossierId: string;
  consultationId: string;
  patient: string;
  libelle: string;
  typeActe: string;
  notes: string | null;
  creeLe: string;
};

export type DossierRechercheMedecins = {
  id: string;
  numero: string;
  nomComplet: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  updatedAt: string;
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
}

export interface ConsultationResume {
  id: string;
  motif: string;
  debutLe: string;
  finLe: string | null;
  medecin: string;
}

export interface DetailPatientMedecins extends PatientFileMedecins {
  constantesVitales: ConstanteVitaleResume | null;
  consultations: ConsultationResume[];
}

export interface DiagnosticConsultationMedecins {
  id: string;
  codeCim: string | null;
  libelle: string;
  principal: boolean;
}

export interface ActeConsultationMedecins {
  id: string;
  typeActe: string;
  libelle: string;
  quantite: number;
  notes: string | null;
}

export interface ConsultationDetailMedecins {
  id: string;
  dossierId: string;
  medecinId: string;
  motif: string;
  anamnese: string | null;
  examenClinique: string | null;
  conclusion: string | null;
  debutLe: string;
  finLe: string | null;
  medecin: string;
  diagnostics: DiagnosticConsultationMedecins[];
  actes: ActeConsultationMedecins[];
  patient: {
    numeroDossier: string;
    numeroPatient: string;
    prenom: string;
    nom: string;
    nomComplet: string;
    telephone: string | null;
    sexe: string | null;
  };
}

export interface ConsultationHistoriqueMedecins {
  id: string;
  dossierId: string;
  motif: string;
  debutLe: string;
  finLe: string;
  medecin: string;
  patient: string;
  numeroDossier: string;
  nbDiagnostics: number;
  nbActes: number;
  conclusion: string | null;
}

export interface TypeExamenMedecins {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: number;
  delaiHeures: number;
}

export interface ExamenMedecinsResume {
  id: string;
  statut: string;
  createdAt: string;
  typeExamen: TypeExamenMedecins;
  notes: string | null;
}

export interface MedicamentMedecins {
  id: string;
  code: string;
  nom: string;
  forme: string | null;
  dosage: string | null;
  prixUnitaire: number;
}

export interface LigneOrdonnanceMedecins {
  id: string;
  medicamentId: string;
  medicament: MedicamentMedecins;
  quantite: number;
  posologie: string | null;
  dureeJours: number | null;
}

export interface OrdonnanceMedecins {
  id: string;
  dossierId: string;
  statut: string;
  prescritLe: string;
  notes: string | null;
  medecin: string;
  patient: string;
  numeroDossier: string;
  lignes: LigneOrdonnanceMedecins[];
}

export interface LitDisponibleMedecins {
  id: string;
  numero: string;
  occupe: boolean;
  chambre: {
    id: string;
    numero: string;
    service: string;
  };
}

export interface AdmissionMedecins {
  id: string;
  dossierId: string;
  statut: string;
  motif: string;
  admisLe: string;
  sortiLe: string | null;
  notes: string | null;
  patient: string;
  numeroDossier: string;
  chambre: { id: string; numero: string; service: string } | null;
  lit: { id: string; numero: string } | null;
}

export interface RendezVousMedecins {
  id: string;
  reference: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  service: string;
  typePrestation: string | null;
  creneau: string | null;
  motif: string | null;
  dateNaissance: string | null;
  premiereVisite: boolean | null;
  dateSouhaitee: string;
  statut: string;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}
