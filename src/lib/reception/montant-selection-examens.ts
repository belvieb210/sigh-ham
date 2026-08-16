import type { PaquetBilanReception, TypeExamenReception } from "@/lib/reception/types";

/** Identifiants d'examens déjà couverts par les paquets sélectionnés. */
export function idsExamensDansPaquets(paquets: PaquetBilanReception[]): Set<string> {
  return new Set(paquets.flatMap((p) => p.examens.map((e) => e.id)));
}

/** Total = forfaits paquets + examens individuels hors paquets. */
export function calculerMontantSelectionExamens(
  paquets: PaquetBilanReception[],
  examensIndividuels: TypeExamenReception[]
): number {
  const idsPaquets = idsExamensDansPaquets(paquets);
  const totalPaquets = paquets.reduce((s, p) => s + p.prix, 0);
  const totalIndividuels = examensIndividuels
    .filter((e) => !idsPaquets.has(e.id))
    .reduce((s, e) => s + e.prix, 0);
  return totalPaquets + totalIndividuels;
}

/** Lignes affichables (devis PDF, estimation) : 1 ligne forfait par paquet + examens unitaires. */
export function construireLignesDevisEstimation(
  paquets: PaquetBilanReception[],
  examensIndividuels: TypeExamenReception[]
): TypeExamenReception[] {
  const idsPaquets = idsExamensDansPaquets(paquets);
  const lignesPaquets: TypeExamenReception[] = paquets.map((p) => ({
    id: `paquet-${p.id}`,
    code: p.code,
    libelle: p.libelle,
    categorie: "Paquet bilan",
    prix: p.prix,
    delaiHeures: p.examens.reduce((max, e) => Math.max(max, e.delaiHeures), 0),
  }));
  const individuels = examensIndividuels.filter((e) => !idsPaquets.has(e.id));
  return [...lignesPaquets, ...individuels];
}
