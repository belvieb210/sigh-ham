import "server-only";
import type { PatientEnregistre } from "@/constants/reception";
import type {
  ListePatientsEnregistresResultat,
  StatsPatientsEnregistres,
} from "@/lib/reception/lister-patients-enregistres";
import type {
  ListePatientsTransferesResultat,
  StatsPatientsTransferes,
} from "@/lib/reception/lister-patients-transferes";
import {
  chargerDossiersAccueilMedecinExterne,
  chargerDossiersVisiteMedecinExterne,
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

export async function listerPatientsEnregistresMedecinExterne(
  medecinExterneId: string,
  limite?: number
): Promise<ListePatientsEnregistresResultat> {
  const dossiers = limite
    ? await chargerDossiersAccueilMedecinExterne(medecinExterneId, limite * 4)
    : await chargerDossiersAccueilMedecinExterne(medecinExterneId);
  const patients = dedupliquerParPatient(dossiersVersPatients(dossiers));
  const stats = calculerStatsEnregistres(dossiers);

  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats,
  };
}

export async function listerPatientsRecentsMedecinExterne(
  medecinExterneId: string,
  limite = 40
): Promise<PatientEnregistre[]> {
  const dossiers = await chargerDossiersAccueilMedecinExterne(
    medecinExterneId,
    Math.max(limite * 6, 60)
  );
  // ME crée un transfert ACCEPTE dès l'enregistrement local — on n'applique
  // pas le filtre « non confirmés » de la réception (qui exclut ACCEPTE).
  const patients = dedupliquerParPatient(dossiersVersPatients(dossiers));
  return patients.slice(0, limite);
}

export async function listerPatientsTransferesMedecinExterne(
  medecinExterneId: string,
  limite?: number
): Promise<ListePatientsTransferesResultat> {
  const dossiers = await chargerDossiersVisiteMedecinExterne(medecinExterneId, {
    limite: limite ? limite * 4 : undefined,
    uniquementTransfert: true,
  });

  const patients = dedupliquerParPatient(
    dossiersVersPatients(trierDossiersParActivite(dossiers))
  );
  const stats = calculerStatsTransferes(dossiers);

  return {
    patients: limite ? patients.slice(0, limite) : patients,
    stats,
  };
}
