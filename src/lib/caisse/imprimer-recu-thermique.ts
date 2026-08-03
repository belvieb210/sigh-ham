/**
 * Bouton imprimante (caisse) → ticket thermique 80 mm dans le navigateur.
 * Le QR imprimé sur le ticket → page reçue digitale (scan téléphone / PC).
 */

import type { FactureResumeJour } from "@/lib/caisse/types";

function cheminSafe(token: string): string {
  if (/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+)?$/.test(token)) {
    return `/r/${token}`;
  }
  return `/r/${encodeURIComponent(token)}`;
}

/** URL de la page reçue (scan QR) — sans auto-impression. */
export function urlRecuPublicFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  const path = cheminSafe(facture.tokenRecu);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/** URL du ticket thermique 80 mm (bouton imprimante caisse). */
export function urlTicketThermiqueFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  const path = `${cheminSafe(facture.tokenRecu)}/ticket?print=1`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/**
 * Ouvre le ticket thermique (image type reçu 80 mm) dans un nouvel onglet.
 */
export function imprimerRecuCaisseThermique(facture: FactureResumeJour): boolean {
  if (typeof window === "undefined") return false;
  const url = urlTicketThermiqueFacture(facture);
  if (!url) return false;

  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (!fenetre) {
    window.location.href = url;
  }
  return true;
}
