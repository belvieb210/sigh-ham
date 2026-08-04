import type { StatutExamen } from "@/generated/prisma/client";

export interface ExamenFileLaboratoire {
  id: string;
  libelle: string;
  categorie: string;
  statut: StatutExamen;
  code: string;
}

export interface PatientFileLaboratoire {
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
  age: number | null;
  arriveeLe: string;
  numeroOrdre: number;
  provenance: string;
  medecinResponsable: string | null;
  examens: ExamenFileLaboratoire[];
  nombreExamens: number;
  numeroFacture: string | null;
  modePaiement: string | null;
  statutFacture: string | null;
}

export interface StatsLaboratoireJour {
  dateReference: string;
  patientsRecusAujourdhui: number;
  patientsEnFile: number;
  examensEnCours: number;
  analysesEnCours: number;
  resultatsAValider: number;
  resultatsValidesAujourdhui: number;
  imprimesEnvoyes: number;
  derniersArrives: PatientFileLaboratoire[];
  patientsTransferes: PatientFileLaboratoire[];
  analysesEnCoursListe: PatientFileLaboratoire[];
}

export interface DetailPatientLaboratoire extends PatientFileLaboratoire {
  photoUrl: string | null;
}
