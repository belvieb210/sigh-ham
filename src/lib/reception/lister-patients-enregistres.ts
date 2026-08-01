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

export async function listerPatientsRecents(limite = 4): Promise<PatientEnregistre[]> {
  const { patients } = await listerPatientsEnregistres(limite);
  return patients;
}
