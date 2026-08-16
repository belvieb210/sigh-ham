import type { PatientEnregistre } from "@/constants/reception";
import type { ResultatRecherchePatientReception } from "@/lib/reception/types";

export interface LibellesPatientRecherche {
  motif: string;
  orientation: string;
  statut: string;
}

export function resultatRechercheVersPatientEnregistre(
  resultat: ResultatRecherchePatientReception,
  libelles: LibellesPatientRecherche
): PatientEnregistre {
  const maintenant = new Date();
  const heure = maintenant.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    cleListe: `recherche-${resultat.numeroPatient}`,
    dossierId: resultat.dossierId ?? "",
    id: resultat.numeroPatient,
    nom: resultat.nomComplet,
    telephone: resultat.telephone,
    motif: libelles.motif,
    orientation: libelles.orientation,
    orientationCouleur: "bg-slate-100 text-slate-600",
    statut: libelles.statut,
    statutCouleur: "bg-indigo-100 text-indigo-800",
    heure,
    dateActivite: maintenant.toISOString(),
  };
}
