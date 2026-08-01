import type { TFunction } from "i18next";

const CODES_ERREUR: Record<string, string> = {
  "Le nom du groupe est obligatoire.": "reception.messagerie.groupe.modal.nomRequis",
  "Action impossible.": "reception.messagerie.groupe.membre.erreur",
  "Action non autorisée.": "reception.messagerie.groupe.membre.erreur",
  "Conversation inaccessible.": "reception.messagerie.erreurListe",
  "Impossible d'envoyer le message.": "reception.messagerie.erreurEnvoi",
  "Impossible de créer la conversation.": "reception.messagerie.erreurCreation",
};

/** Traduit un message d'erreur API (souvent en français) vers la langue active. */
export function traduireErreurApiMessagerie(message: string | undefined, t: TFunction): string {
  if (!message?.trim()) return t("reception.messagerie.erreurEnvoi");
  const cle = CODES_ERREUR[message.trim()];
  if (cle) return t(cle);
  return message;
}
