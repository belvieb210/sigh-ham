/** Compacte PAT/VIS pour l’affichage (PAT-2026-00002 → PAT202600002). */
export function compactNumeroPatOuVis(valeur: string): string {
  if (/^(PAT|VIS)/i.test(valeur)) {
    return valeur.replace(/-/g, "").toUpperCase();
  }
  return valeur;
}

/** True si la valeur est un n° de visite (VIS…), pas le n° patient permanent. */
export function estNumeroVisite(valeur?: string | null): boolean {
  const compact = valeur?.replace(/-/g, "").trim() ?? "";
  return /^VIS\d/i.test(compact);
}

/**
 * N° permanent patient (YYYYMMDD…).
 * Ignore les n° de visite (VIS…) et de transfert (PAT…).
 */
export function afficherNumeroPatientPermanent(
  ...candidats: Array<string | null | undefined>
): string {
  for (const candidat of candidats) {
    const valeur = candidat?.trim() ?? "";
    if (!valeur || valeur === "—") continue;
    const compact = valeur.replace(/-/g, "");
    if (/^(VIS|PAT)\d/i.test(compact)) continue;
    return valeur;
  }
  return "";
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
