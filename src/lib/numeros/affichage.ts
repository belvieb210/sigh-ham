/** Compacte PAT/VIS pour l’affichage (PAT-2026-00002 → PAT202600002). */
export function compactNumeroPatOuVis(valeur: string): string {
  if (/^(PAT|VIS)/i.test(valeur)) {
    return valeur.replace(/-/g, "").toUpperCase();
  }
  return valeur;
}

/**
 * N° de visite (DossierPatient.numeroDossier).
 * Ne jamais y passer le n° permanent (YYYYMMDD…).
 */
export function afficherNumeroVisite(numeroDossier?: string | null): string {
  const brut = numeroDossier?.trim();
  if (!brut) return "—";
  return compactNumeroPatOuVis(brut);
}
