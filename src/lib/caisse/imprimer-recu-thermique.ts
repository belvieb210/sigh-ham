/**
 * Ouvre le reçu facture dans le navigateur (PC / téléphone).
 * Le QR code pointe vers la même URL, liée à cette facture précise.
 */

import type { FactureResumeJour } from "@/lib/caisse/types";

export function urlRecuPublicFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  const path = `/r/${encodeURIComponent(facture.tokenRecu)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/**
 * Ouvre la page reçue dans un nouvel onglet navigateur.
 * `@param avecImpression` déclenche aussi l'impression du ticket 80 mm.
 */
export function imprimerRecuCaisseThermique(
  facture: FactureResumeJour,
  options?: { avecImpression?: boolean }
): boolean {
  if (typeof window === "undefined") return false;
  const base = urlRecuPublicFacture(facture);
  if (!base) return false;

  const url =
    options?.avecImpression === false
      ? base
      : `${base}${base.includes("?") ? "&" : "?"}print=1`;

  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (!fenetre) {
    // Popup bloquée : navigation même onglet
    window.location.href = url;
  }
  return true;
}
