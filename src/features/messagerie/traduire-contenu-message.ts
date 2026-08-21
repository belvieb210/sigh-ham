import type { TFunction } from "i18next";
import {
  estMarqueurPieceJointe,
  MARQUEUR_TRANSFERT_INDISPONIBLE,
} from "@/lib/messagerie/marqueurs-contenu";

const MOTIFS_TRANSFERT = [
  /^⟦FWD⟧(.+)\n([\s\S]*)$/,
  /^↪ Transféré de (.+):\n([\s\S]*)$/,
  /^↪ Forwarded from (.+):\n([\s\S]*)$/,
  /^↪ 转发自 (.+):\n([\s\S]*)$/,
  /^↪ Imehamishwa kutoka kwa (.+):\n([\s\S]*)$/,
  /^↪ Etindami na (.+):\n([\s\S]*)$/,
] as const;

/** Messages seed connus (texte FR en base) → clé i18n. */
const CLES_MESSAGES_DEMO: Record<string, string> = {
  "Bonjour à toutes et à tous. Le flux du matin est actif — merci de confirmer les transferts en attente.":
    "reception.messagerie.demo.receptionMatin",
  "Reçu. 3 patients en attente de constantes vitales.":
    "reception.messagerie.demo.infirmiersConstantes",
  "URGENT — Patient PAT-2026-0338 en détresse respiratoire, merci de prioriser le transfert infirmiers → médecins.":
    "reception.messagerie.demo.urgentDetresse",
  "Résultats NFS disponibles pour PAT-2026-0340. Le médecin traitant sera notifié via transfert dossier.":
    "reception.messagerie.demo.laboNfs",
  "Belvie, peux-tu vérifier le dossier de MULUMBA Jean avant facturation caisse ?":
    "reception.messagerie.demo.directMedecin",
};

/**
 * Traduit les contenus système (transfert, pièce jointe, démos).
 * Les messages saisis par l'utilisateur restent inchangés (pratique clinique / entreprise).
 */
export function traduireContenuMessage(contenu: string, t: TFunction): string {
  const texte = contenu.trim();

  if (!texte || estMarqueurPieceJointe(texte)) {
    return t("reception.messagerie.pieceJointe");
  }

  if (
    texte === MARQUEUR_TRANSFERT_INDISPONIBLE ||
    texte === "[Message transféré — contenu indisponible]"
  ) {
    return t("reception.messagerie.contenuTransfereIndisponible");
  }

  for (const motif of MOTIFS_TRANSFERT) {
    const match = texte.match(motif);
    if (match) {
      const corps = match[2] ?? "";
      const corpsTraduit = estMarqueurPieceJointe(corps)
        ? t("reception.messagerie.pieceJointe")
        : corps;
      return t("reception.messagerie.contenuTransfere", {
        nom: match[1],
        texte: corpsTraduit,
      });
    }
  }

  const cleDemo = CLES_MESSAGES_DEMO[texte];
  if (cleDemo) {
    const traduit = t(cleDemo);
    if (traduit && traduit !== cleDemo) return traduit;
  }

  return contenu;
}
