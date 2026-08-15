import "server-only";
import { prisma } from "@/lib/prisma";
import type { PayloadEnvoiMessage } from "@/lib/messagerie/types";
import type { MessageConversation } from "@/lib/messagerie/types";
import { publierRedis, CANAUX_REDIS } from "@/lib/redis/client";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";
import {
  resoudreMentions,
  notifierMentions,
} from "@/lib/messagerie/actions-avancees";
import { evenementNouveauMessage } from "@/lib/notifications/evenements-metier";

export async function envoyerMessage(
  conversationId: string,
  utilisateurId: string,
  payload: PayloadEnvoiMessage
): Promise<MessageConversation> {
  const contenu = payload.contenu?.trim();
  const aFichier = payload.fichiers && payload.fichiers.length > 0;
  if (!contenu && !aFichier) {
    throw new Error("CONTENU_VIDE");
  }

  const participation = await prisma.participantConversation.findUnique({
    where: {
      conversationId_utilisateurId: { conversationId, utilisateurId },
    },
    include: {
      conversation: { select: { patientId: true, bloquee: true } },
    },
  });

  if (!participation || participation.conversation.patientId !== null) {
    throw new Error("CONVERSATION_INACCESSIBLE");
  }

  if (participation.conversation.bloquee) {
    throw new Error("CONVERSATION_BLOQUEE");
  }

  const expediteur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: { messagerieBloquee: true, statut: true },
  });
  if (
    !expediteur ||
    expediteur.statut !== "ACTIF" ||
    expediteur.messagerieBloquee
  ) {
    throw new Error("MESSAGERIE_BLOQUEE");
  }

  const mentions = contenu ? await resoudreMentions(contenu) : [];

  const message = await prisma.$transaction(async (tx) => {
    const cree = await tx.message.create({
      data: {
        conversationId,
        expediteurId: utilisateurId,
        contenu: contenu ?? "📎 Pièce jointe",
        priorite: payload.priorite ?? "NORMALE",
        type: payload.type ?? "TEXTE",
        messageParentId: payload.messageParentId,
        metadonnees: payload.metadonnees ? (payload.metadonnees as object) : undefined,
        lectures: { create: { utilisateurId } },
        mentions: {
          create: mentions.map((m) => ({ destinataireId: m.id })),
        },
      },
      include: {
        expediteur: { include: { role: true } },
        lectures: true,
        piecesJointes: true,
        reactions: true,
        messageParent: {
          include: { expediteur: { select: { prenom: true, nom: true } } },
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    await tx.participantConversation.update({
      where: {
        conversationId_utilisateurId: { conversationId, utilisateurId },
      },
      data: { dernierLuLe: new Date() },
    });

    return cree;
  });

  if (payload.fichiers?.length) {
    const { uploaderFichier, typePieceJointeDepuisMime } = await import("@/lib/stockage/fichiers");
    for (const f of payload.fichiers) {
      const upload = await uploaderFichier(f.buffer, f.nom, f.mimeType);
      await prisma.pieceJointe.create({
        data: {
          messageId: message.id,
          nom: upload.nom,
          type: typePieceJointeDepuisMime(upload.mimeType),
          mimeType: upload.mimeType,
          taille: upload.taille,
          url: upload.url,
          bucket: upload.bucket,
          cleStockage: upload.cleStockage,
        },
      });
    }
  }

  const msgComplet = await prisma.message.findUnique({
    where: { id: message.id },
    include: {
      expediteur: { include: { role: true } },
      lectures: true,
      piecesJointes: true,
      reactions: true,
      messageParent: {
        include: { expediteur: { select: { prenom: true, nom: true } } },
      },
    },
  });

  if (!msgComplet) throw new Error("MESSAGE_INTROUVABLE");

  const msg = msgComplet as typeof msgComplet & {
    expediteur: { id: string; prenom: string; nom: string; role: { nom: string } };
  };

  await publierRedis(CANAUX_REDIS.messagerie, {
    event: EVENEMENTS_SOCKET.NOUVEAU_MESSAGE,
    conversationId,
    messageId: msg.id,
    expediteurId: utilisateurId,
  });

  const participants = await prisma.participantConversation.findMany({
    where: { conversationId, utilisateurId: { not: utilisateurId } },
    select: { utilisateurId: true },
  });

  const nomExp = `${msg.expediteur.prenom} ${msg.expediteur.nom}`;
  void evenementNouveauMessage({
    destinataireIds: participants.map((p) => p.utilisateurId),
    expediteurNom: nomExp,
    conversationId,
    apercu: contenu ?? "Pièce jointe",
  });

  if (mentions.length > 0) {
    void notifierMentions(
      msg.id,
      mentions.map((m) => m.id),
      nomExp,
      conversationId
    );
  }

  return mapperMessage(msg, utilisateurId);
}

export function mapperMessage(
  m: {
    id: string;
    type: MessageConversation["type"];
    priorite: MessageConversation["priorite"];
    contenu: string;
    metadonnees: unknown;
    envoyeLe: Date;
    modifieLe: Date | null;
    supprime: boolean;
    supprimeLe?: Date | null;
    expediteur: { id: string; prenom: string; nom: string; role: { nom: string } };
    lectures: { utilisateurId: string }[];
    piecesJointes?: { id: string; nom: string; url: string; type: string; mimeType: string; taille: number }[];
    reactions?: { emoji: string; utilisateurId: string }[];
    messageParent?: { id: string; contenu: string; supprime: boolean; expediteur: { prenom: string; nom: string } } | null;
  },
  utilisateurId: string
): MessageConversation {
  return {
    id: m.id,
    type: m.type,
    priorite: m.priorite,
    contenu: m.supprime ? "" : m.contenu,
    metadonnees: m.metadonnees as Record<string, unknown> | null,
    envoyeLe: m.envoyeLe.toISOString(),
    modifieLe: m.modifieLe?.toISOString() ?? null,
    supprime: m.supprime,
    supprimeLe: m.supprimeLe?.toISOString() ?? null,
    expediteur: {
      id: m.expediteur.id,
      prenom: m.expediteur.prenom,
      nom: m.expediteur.nom,
      role: m.expediteur.role.nom,
    },
    estMoi: m.expediteur.id === utilisateurId,
    luParMoi: m.lectures.some((l) => l.utilisateurId === utilisateurId),
    nbLectures: m.lectures.length,
    piecesJointes: m.supprime
      ? []
      : m.piecesJointes?.map((p) => ({
          id: p.id,
          nom: p.nom,
          url: p.url,
          type: p.type,
          mimeType: p.mimeType,
          taille: p.taille,
        })),
    reactions: m.supprime
      ? []
      : m.reactions?.map((r) => ({
          emoji: r.emoji,
          utilisateurId: r.utilisateurId,
        })),
    messageParent: m.messageParent
      ? {
          id: m.messageParent.id,
          contenu: m.messageParent.supprime ? "" : m.messageParent.contenu,
          expediteurNom: `${m.messageParent.expediteur.prenom} ${m.messageParent.expediteur.nom}`,
        }
      : null,
  };
}
