export const EVENEMENTS_SOCKET = {
  CONNECTE: "connecte",
  NOUVEAU_MESSAGE: "nouveau_message",
  MESSAGE_SUPPRIME: "message_supprime",
  MESSAGE_LU: "message_lu",
  TYPING: "typing",
  PRESENCE: "presence",
  NOUVELLE_NOTIFICATION: "nouvelle_notification",
  REACTION: "reaction",
} as const;

export type PayloadNouveauMessage = {
  conversationId: string;
  messageId: string;
  expediteurId: string;
};

export type PayloadMessageSupprime = {
  conversationId: string;
  messageId: string;
  portee: "tous";
};

export type PayloadNotification = {
  utilisateurId: string;
  notificationId: string;
};

export type PayloadPresence = {
  utilisateurId: string;
  statut: string;
  prenom?: string;
  nom?: string;
};
