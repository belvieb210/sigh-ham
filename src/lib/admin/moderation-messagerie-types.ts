export type CategorieFeedModeration =
  | "tous"
  | "messages"
  | "conversations"
  | "groupes"
  | "fichiers"
  | "suspensions";

export type StatutElementModeration =
  | "nouveau"
  | "en_cours"
  | "resolu"
  | "bloque"
  | "supprime"
  | "suspendu";

export type StatsModeration = {
  conversationsTotal: number;
  conversationsBloquees: number;
  groupesSupprimes: number;
  messagesSupprimes: number;
  messagesSignales: number;
  messagesBloques: number;
  fichiersSignales: number;
  fichiersSupprimes: number;
  utilisateursMessagerieBloquee: number;
};

export type ElementFeedModeration = {
  id: string;
  kind: "message" | "conversation" | "groupe" | "fichier" | "suspension";
  titre: string;
  initiales: string;
  auteur: string;
  auteurId: string | null;
  auteurIdentifiant: string | null;
  contenu: string;
  raison: string | null;
  statut: StatutElementModeration;
  dateIso: string;
  conversationId: string | null;
  conversationSujet: string | null;
  messageId: string | null;
  fichierUrl: string | null;
  fichierMime: string | null;
  estImage: boolean;
  bloque: boolean;
  supprime: boolean;
  signale: boolean;
  avertissementEnvoye: boolean;
};
