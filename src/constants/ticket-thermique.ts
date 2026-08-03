/** Format ticket thermique 80 mm (Xprinter XP-C230) — ~42 caractères utiles. */

export const LARGEUR_TICKET_THERMIQUE = 42;

export const INFOS_LEGALES_TICKET = {
  ligne1: "CENTRE DES DIAGNOSTICS ET D'ANALYSES",
  ligne2: 'MEDICALES "HAM LABORATOIRE"',
  rccm: "RCCM : CD/KNM/RCCM/24-A-04789",
  idNat: "ID.NAT : 01-S9502-N541195",
  nImpot: "N° IMPOT A2529225X MIN/SANTE:",
  minSante: "31024 CAB MIN/2024",
  sloganLigne1: "VOTRE SANTE MON FARDEAU,",
  sloganLigne2: "LA FIABILITÉ NOTRE PREEMINENCE",
  sloganPied: "La santé plus proche de chez vous !",
  adresseLigne1: "Sur 209 av/ lumiere entrée debonhomme",
  adresseLigne2: "3ème parcelle à droit commune matete",
  ville: "Kinshasa RD Congo",
  /** Adresse complète (devis PDF / documents officiels) */
  adresseComplete:
    "259, Avenue Lumière, Entrée Debonhomme Troisième Parcelle À Droit Commune MATETE, Kinshasa, République démocratique du Congo",
  telephones: "+243 815 125 111 - 813 191 643",
  email: "obb5lab@gmail.com",
} as const;

export const SEPARATEUR_ETOILES = "*".repeat(LARGEUR_TICKET_THERMIQUE);
export const SEPARATEUR_TIRETS = "-".repeat(LARGEUR_TICKET_THERMIQUE);

export function tronquerTexte(texte: string, max: number): string {
  const t = texte.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/** Centre une ligne dans la largeur ticket (espaces monospace). */
export function centrerLigne(texte: string, largeur = LARGEUR_TICKET_THERMIQUE): string {
  const t = tronquerTexte(texte, largeur);
  const pad = Math.max(0, largeur - t.length);
  const gauche = Math.floor(pad / 2);
  return `${" ".repeat(gauche)}${t}${" ".repeat(pad - gauche)}`;
}

/**
 * Ligne Description (gauche) + Prix (droite).
 * Si trop long, tronque la description.
 */
export function ligneDeuxColonnes(
  gauche: string,
  droite: string,
  largeur = LARGEUR_TICKET_THERMIQUE
): string {
  const d = droite.trim();
  const maxGauche = Math.max(1, largeur - d.length - 1);
  const g = tronquerTexte(gauche, maxGauche);
  const espaces = Math.max(1, largeur - g.length - d.length);
  return `${g}${" ".repeat(espaces)}${d}`;
}

export function formaterPrixTicket(prix: number): string {
  const n = prix.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${n}$`;
}
