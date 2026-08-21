/**
 * Marqueurs stables pour contenus système messagerie (indépendants de la langue).
 * Affichage via i18n côté client — comme les grandes apps chat (Slack/Teams).
 */

export const MARQUEUR_PIECE_JOINTE = "⟦ATTACH⟧";
export const MARQUEUR_TRANSFERT_INDISPONIBLE = "⟦FWD_UNAVAILABLE⟧";

/** Préfixe transfert : ⟦FWD⟧Nom\ncontenu */
export function formaterContenuTransfere(nomExpediteur: string, texte: string): string {
  const nom = nomExpediteur.trim() || "—";
  return `⟦FWD⟧${nom}\n${texte}`;
}

export function estMarqueurPieceJointe(contenu: string): boolean {
  const t = contenu.trim();
  return t === MARQUEUR_PIECE_JOINTE || t === "📎 Pièce jointe" || t === "Pièce jointe";
}
