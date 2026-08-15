export interface EstimationFiltrable {
  id: string;
  numeroPatient: string;
  nomComplet: string;
  statut: string;
  emetteurNom?: string;
  libelleSource?: string | null;
  nomConvention?: string | null;
  typeEstimation?: "CONVENTION_EGLISE" | "MEDECIN_EXTERNE" | "PHARMACIE_CLIENT";
}

export interface FiltresEstimations {
  recherche: string;
  statut: string;
  typeEstimation: string;
}

export const FILTRES_ESTIMATIONS_VIDES: FiltresEstimations = {
  recherche: "",
  statut: "",
  typeEstimation: "",
};

export function compterFiltresEstimations(
  filtres: FiltresEstimations,
  options?: { avecType?: boolean }
): number {
  let n = 0;
  if (filtres.recherche.trim()) n += 1;
  if (filtres.statut) n += 1;
  if (options?.avecType && filtres.typeEstimation) n += 1;
  return n;
}

export function estimationCorrespondFiltres(
  e: EstimationFiltrable,
  filtres: FiltresEstimations,
  options?: { avecType?: boolean }
): boolean {
  const q = filtres.recherche.trim().toLowerCase();
  if (q) {
    const haystack = [
      e.nomComplet,
      e.numeroPatient,
      e.emetteurNom,
      e.libelleSource,
      e.nomConvention,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filtres.statut && e.statut !== filtres.statut) return false;
  if (
    options?.avecType &&
    filtres.typeEstimation &&
    e.typeEstimation !== filtres.typeEstimation
  ) {
    return false;
  }
  return true;
}
