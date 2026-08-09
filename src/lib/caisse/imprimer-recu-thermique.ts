/**
 * Bouton imprimante (caisse) → une seule fenêtre : ticket thermique 80 mm.
 * Le QR du ticket → page reçue publique (URL de production, jamais localhost).
 */

import type { FactureResumeJour } from "@/lib/caisse/types";

function cheminSafe(token: string): string {
  if (/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+)?$/.test(token)) {
    return `/r/${token}`;
  }
  return `/r/${encodeURIComponent(token)}`;
}

/** URL de la page reçue (scan QR). */
export function urlRecuPublicFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  const path = cheminSafe(facture.tokenRecu);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/** URL du ticket thermique — sans auto-impression. */
export function urlTicketThermiqueFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  const path = `${cheminSafe(facture.tokenRecu)}/ticket`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

/**
 * Ouvre le ticket thermique pharmacie (sans QR) dans un nouvel onglet.
 */
export function ouvrirTicketPharmacieFacture(facture: FactureResumeJour): boolean {
  return imprimerRecuCaisseThermique(facture);
}

/**
 * Ouvre le ticket dans un seul onglet.
 * Ne pas utiliser l'option `noopener` de window.open : elle renvoie null
 * et déclenchait à tort une 2ᵉ navigation (2 onglets).
 */
export function imprimerRecuCaisseThermique(facture: FactureResumeJour): boolean {
  if (typeof window === "undefined") return false;
  const url = urlTicketThermiqueFacture(facture);
  if (!url) return false;

  const fenetre = window.open(url, "_blank");
  if (fenetre) {
    try {
      fenetre.opener = null;
    } catch {
      /* ignore */
    }
    fenetre.focus();
    return true;
  }

  // Popup vraiment bloquée : même onglet uniquement
  window.location.assign(url);
  return true;
}
