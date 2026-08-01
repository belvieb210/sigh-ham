import type { TFunction } from "i18next";

const MOTIFS_TRANSFERT = [
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

/** Traduit préfixes transfert et messages de démonstration seed ; le reste reste tel quel. */
export function traduireContenuMessage(contenu: string, t: TFunction): string {
  const texte = contenu.trim();

  for (const motif of MOTIFS_TRANSFERT) {
    const match = texte.match(motif);
    if (match) {
      return t("reception.messagerie.contenuTransfere", {
        nom: match[1],
        texte: match[2],
      });
    }
  }

  const cleDemo = CLES_MESSAGES_DEMO[texte];
  if (cleDemo) {
    const traduit = t(cleDemo, { defaultValue: "" });
    if (traduit) return traduit;
  }

  return contenu;
}
