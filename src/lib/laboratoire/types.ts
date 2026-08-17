import type { StatutExamen } from "@/generated/prisma/client";

export interface ExamenFileLaboratoire {
  id: string;
  libelle: string;
  categorie: string;
  statut: StatutExamen;
  code: string;
  notes?: string | null;
}

export interface PatientFileLaboratoire {
  fileAttenteId: string;
  passageId: string;
  transfertId: string;
  /** Ligne unique (dossier, ou dossier+facture si plusieurs factures). */
  cleListe?: string;
  dossierId: string;
  numeroPatient: string;
  numeroDossier: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  sexe: string | null;
  dateNaissance: string | null;
  age: number | null;
  arriveeLe: string;
  numeroOrdre: number;
  provenance: string;
  medecinResponsable: string | null;
  /** N° transfert (ex. PAT202600001) — identique pour tous les hops d'une même VIS. */
  numeroTransfert: string | null;
  /** N° permanent patient (ex. 20260902012). */
  numeroEnregistrement: string;
  heureTransfert: string | null;
  heureEnregistrement: string | null;
  enregistrePar: string | null;
  transferePar: string | null;
  examens: ExamenFileLaboratoire[];
  nombreExamens: number;
  /** Statut d'analyse labo (Reçus, En cours, Vérifiés…) */
  statutAnalyse: string;
  numeroFacture: string | null;
  modePaiement: string | null;
  statutFacture: string | null;
  /** Transfert sortant labo (orientation rapide, à confirmer) */
  transfertSortantId: string | null;
  statutTransfertSortant: string | null;
  codeSalleDestination: string | null;
  /** Destinations multiples cochées (orientation rapide) */
  codesSalleDestination: string[];
  enRecuperation: boolean;
  orientation: string;
}

export interface StatsLaboratoireJour {
  dateReference: string;
  patientsRecusAujourdhui: number;
  patientsEnFile: number;
  /** Arrivées file labo (ISO) — badge non lus côté client */
  arriveesFileIso: string[];
  examensEnCours: number;
  analysesEnCours: number;
  resultatsAValider: number;
  resultatsValidesAujourdhui: number;
  imprimesEnvoyes: number;
  /** Compteurs par page statut analyse (badges nav) */
  compteursStatutAnalyse: {
    RECUS: number;
    EN_COURS: number;
    VERIFIES: number;
    REJETES: number;
    DR_APPROUVE: number;
  };
  derniersArrives: PatientFileLaboratoire[];
  patientsTransferes: PatientFileLaboratoire[];
  analysesEnCoursListe: PatientFileLaboratoire[];
  resultatsAValiderListe: PatientFileLaboratoire[];
  resultatsValidesListe: PatientFileLaboratoire[];
}

export interface DetailPatientLaboratoire extends PatientFileLaboratoire {
  photoUrl: string | null;
}
