import type { CodeSalle, PrioriteMessage, TypeConversation, TypeMessage } from "@/generated/prisma/enums";

export interface ContactMessagerie {
  id: string;
  prenom: string;
  nom: string;
  role: string;
  salleCode: CodeSalle | null;
  salleNom: string | null;
}

export interface ConversationResume {
  id: string;
  type: TypeConversation;
  sujet: string | null;
  photoUrl: string | null;
  salleCode: CodeSalle | null;
  epingle: boolean;
  epinglePerso: boolean;
  nonLus: number;
  dernierMessage: {
    id: string;
    contenu: string;
    envoyeLe: string;
    expediteurNom: string;
    priorite: PrioriteMessage;
    supprime: boolean;
  } | null;
  participants: {
    id: string;
    prenom: string;
    nom: string;
    /** Fonction hospitalière (ex. Réceptionniste) */
    role: string;
    /** Rôle dans le groupe (admin / membre) */
    roleGroupe: "ADMIN" | "MEMBRE";
  }[];
  libelle: string;
  sousTitre: string | null;
}

export interface MessageConversation {
  id: string;
  type: TypeMessage;
  priorite: PrioriteMessage;
  contenu: string;
  metadonnees: Record<string, unknown> | null;
  envoyeLe: string;
  modifieLe: string | null;
  supprime: boolean;
  supprimeLe?: string | null;
  expediteur: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  };
  estMoi: boolean;
  luParMoi: boolean;
  nbLectures: number;
  piecesJointes?: {
    id: string;
    nom: string;
    url: string;
    type: string;
    mimeType: string;
    taille: number;
  }[];
  reactions?: { emoji: string; utilisateurId: string }[];
  messageParent?: {
    id: string;
    contenu: string;
    expediteurNom: string;
  } | null;
}

export interface DetailConversation extends ConversationResume {
  archivee: boolean;
  createurId: string | null;
}

export interface PayloadEnvoiMessage {
  contenu: string;
  priorite?: PrioriteMessage;
  type?: TypeMessage;
  metadonnees?: Record<string, unknown>;
  messageParentId?: string;
  fichiers?: { buffer: Buffer; nom: string; mimeType: string }[];
}

export interface PayloadCreerConversation {
  type: TypeConversation;
  sujet?: string;
  photoUrl?: string;
  participantIds?: string[];
  salleCode?: CodeSalle;
  categorieGroupe?: import("@/generated/prisma/enums").CategorieGroupe;
  premierMessage?: string;
  prioritePremierMessage?: PrioriteMessage;
}

export type FiltreConversation = "tous" | "non_lus" | "canaux" | "directs" | "groupes" | "epingles";
