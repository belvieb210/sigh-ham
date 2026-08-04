import "server-only";
import type { PatientEnregistre } from "@/constants/reception";
import {
  estPatientTransfertNonConfirme,
  type ListePatientsEnregistresResultat,
  type StatsPatientsEnregistres,
} from "@/lib/reception/lister-patients-enregistres";
import type {
  ListePatientsTransferesResultat,
  StatsPatientsTransferes,
} from "@/lib/reception/lister-patients-transferes";
import {
  chargerDossiersAccueilEglise,
  chargerDossiersVisiteEglise,
  dateActiviteVisite,
  dedupliquerParPatient,
  dossiersVersPatients,
  trierDossiersParActivite,
  type DossierVisite,
} from "@/lib/reception/mapper-visite-patient";

function calculerStatsEnregistres(dossiers: DossierVisite[]): StatsPatientsEnregistres {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const dossiersAujourdhui = trierDossiersParActivite(
    dossiers.filter((d) => dateActiviteVisite(d) >= debutJour)
  );
  const patientsAujourdhui = dedupliquerParPatient(
    dossiersVersPatients(dossiersAujourdhui)
  );
  return {
    aujourdhui: patientsAujourdhui.length,
    enAttente: patientsAujourdhui.filter(
      (p) => p.statut === "En attente" || p.statut === "À confirmer"
    ).length,
  };
}

function calculerStatsTransferes(dossiers: DossierVisite[]): StatsPatientsTransferes {
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

export async function listerPatientsEnregistresEglise(
  limite?: number
): Promise<ListePatientsEnregistresResultat> {
  const dossiers = limite
    ? await chargerDossiersAccueilEglise(limite * 4)
    : await chargerDossiersAccueilEglise();
  const patients = dedupliquerParPatient(dossiersVersPatients(dossiers));
  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats: calculerStatsEnregistres(dossiers),
  };
}

export async function listerPatientsRecentsEglise(
  limite = 40
): Promise<PatientEnregistre[]> {
  const dossiers = await chargerDossiersAccueilEglise(Math.max(limite * 6, 60));
  return dedupliquerParPatient(dossiersVersPatients(dossiers))
    .filter(estPatientTransfertNonConfirme)
    .slice(0, limite);
}

export async function listerPatientsTransferesEglise(
  limite?: number
): Promise<ListePatientsTransferesResultat> {
  const dossiers = await chargerDossiersVisiteEglise({
    limite: limite ? limite * 4 : undefined,
    uniquementTransfert: true,
  });
  const patients = dedupliquerParPatient(
    dossiersVersPatients(trierDossiersParActivite(dossiers))
  );
  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats: calculerStatsTransferes(dossiers),
  };
}
