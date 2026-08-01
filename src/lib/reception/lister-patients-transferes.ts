import "server-only";
import type { PatientEnregistre } from "@/constants/reception";
import {
  chargerDossiersVisiteReception,
  dateActiviteVisite,
  dedupliquerParPatient,
  dossiersVersPatients,
  trierDossiersParActivite,
  type DossierVisite,
} from "@/lib/reception/mapper-visite-patient";

export interface StatsPatientsTransferes {
  aujourdhui: number;
  versInfirmiers: number;
  versCaisse: number;
}

export interface ListePatientsTransferesResultat {
  patients: PatientEnregistre[];
  stats: StatsPatientsTransferes;
}

function calculerStats(dossiers: DossierVisite[]): StatsPatientsTransferes {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const patients = dedupliquerParPatient(
    dossiersVersPatients(trierDossiersParActivite(dossiers))
  );

  const dossiersRecentsParPatient = new Map<string, DossierVisite>();
  for (const dossier of trierDossiersParActivite(dossiers)) {
    if (!dossiersRecentsParPatient.has(dossier.patient.numeroPatient)) {
      dossiersRecentsParPatient.set(dossier.patient.numeroPatient, dossier);
    }
  }

  const aujourdhui = Array.from(dossiersRecentsParPatient.values()).filter(
    (d) => dateActiviteVisite(d) >= debutJour
  ).length;

  return {
    aujourdhui,
    versInfirmiers: patients.filter((p) => p.orientation === "Infirmiers").length,
    versCaisse: patients.filter((p) => p.orientation === "Caisse").length,
  };
}

export async function listerPatientsTransferes(
  limite?: number
): Promise<ListePatientsTransferesResultat> {
  const dossiers = await chargerDossiersVisiteReception({
    limite: limite ? limite * 4 : undefined,
    uniquementTransfertDepuisReception: true,
  });

  const patients = dedupliquerParPatient(dossiersVersPatients(trierDossiersParActivite(dossiers)));
  const stats = calculerStats(dossiers);

  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats,
  };
}
