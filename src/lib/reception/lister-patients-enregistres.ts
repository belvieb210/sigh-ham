import "server-only";
import type { PatientEnregistre } from "@/constants/reception";
import {
  chargerDossiersAccueil,
  dateActiviteVisite,
  dedupliquerParPatient,
  dossiersVersPatients,
  trierDossiersParActivite,
  type DossierVisite,
} from "@/lib/reception/mapper-visite-patient";

export interface StatsPatientsEnregistres {
  aujourdhui: number;
  enAttente: number;
}

export interface ListePatientsEnregistresResultat {
  patients: PatientEnregistre[];
  stats: StatsPatientsEnregistres;
}

/** Transfert pas encore confirmé (ou patient pas encore orienté). */
export function estPatientTransfertNonConfirme(patient: PatientEnregistre): boolean {
  const statut = patient.statutTransfert;
  if (!statut) return true;
  if (statut === "ACCEPTE" || statut === "TERMINE") return false;
  if (statut === "REFUSE") return Boolean(patient.enRecuperation);
  // EN_ATTENTE, EN_TRAITEMENT, etc.
  return true;
}

function calculerStats(dossiers: DossierVisite[]): StatsPatientsEnregistres {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const dossiersAujourdhui = trierDossiersParActivite(
    dossiers.filter((d) => dateActiviteVisite(d) >= debutJour)
  );

  const patientsAujourdhui = dedupliquerParPatient(dossiersVersPatients(dossiersAujourdhui));

  return {
    aujourdhui: patientsAujourdhui.length,
    enAttente: patientsAujourdhui.filter(
      (p) => p.statut === "En attente" || p.statut === "À confirmer"
    ).length,
  };
}

export async function listerPatientsEnregistres(
  limite?: number
): Promise<ListePatientsEnregistresResultat> {
  const dossiers = limite
    ? await chargerDossiersAccueil(limite * 4)
    : await chargerDossiersAccueil();
  const patients = dedupliquerParPatient(dossiersVersPatients(dossiers));
  const stats = calculerStats(dossiers);

  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats,
  };
}

/**
 * Accueil réception : patients dont le transfert n'est pas encore confirmé.
 * Une fois confirmé (ACCEPTE), ils disparaissent de cette liste.
 */
export async function listerPatientsRecents(limite = 40): Promise<PatientEnregistre[]> {
  const dossiers = await chargerDossiersAccueil(Math.max(limite * 6, 60));
  const patients = dedupliquerParPatient(dossiersVersPatients(dossiers)).filter(
    estPatientTransfertNonConfirme
  );
  return patients.slice(0, limite);
}
