import "server-only";
import { prisma } from "@/lib/prisma";
import { publierRedis, CANAUX_REDIS } from "@/lib/redis/client";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";
import { creerNotification } from "@/lib/notifications/service-notifications";
import { metadonneesNotificationI18n } from "@/lib/notifications/cles-i18n";
import { lienMessagerieReception } from "@/lib/notifications/liens";
import { creerConversation } from "@/lib/messagerie/creer-conversation";
import {
  formaterContenuTransfere,
  MARQUEUR_TRANSFERT_INDISPONIBLE,
} from "@/lib/messagerie/marqueurs-contenu";
import type { CategorieGroupe } from "@/generated/prisma/enums";

export async function creerDiffusion(
  utilisateurId: string,
  contenu: string,
  sujet?: string
) {
  const role = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    include: { role: true },
  });

  if (!role?.role.systeme && role?.role.code !== "ADMIN" && role?.role.code !== "SUPER_ADMIN") {
    throw new Error("NON_AUTORISE");
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: "DIFFUSION",
      sujet: sujet ?? null,
      createurId: utilisateurId,
      epingle: true,
      messages: {
        create: {
          expediteurId: utilisateurId,
          contenu,
          type: "SYSTEME",
          priorite: "URGENTE",
          lectures: { create: { utilisateurId } },
        },
      },
    },
  });

  const utilisateurs = await prisma.utilisateur.findMany({
    where: { statut: "ACTIF" },
    select: { id: true },
  });

  await prisma.participantConversation.createMany({
    data: utilisateurs.map((u) => ({
      conversationId: conversation.id,
      utilisateurId: u.id,
      role: u.id === utilisateurId ? "ADMIN" : "MEMBRE",
    })),
    skipDuplicates: true,
  });

  const { notifierTous } = await import("@/lib/notifications/service-notifications");
  const apercu = contenu.slice(0, 200);
  await notifierTous({
    type: "DIFFUSION",
    titre: sujet ?? "Annonce institutionnelle",
    message: apercu,
    lien: lienMessagerieReception(conversation.id),
    metadonnees: metadonneesNotificationI18n("DIFFUSION", {
      apercu,
      sujet: sujet ?? "",
    }),
  });

  return conversation;
}

export async function creerGroupeSpecialise(
  utilisateurId: string,
  sujet: string,
  categorie: CategorieGroupe,
  participantIds: string[]
) {
  return creerConversation(utilisateurId, {
    type: "GROUPE",
    sujet,
    participantIds,
    premierMessage: undefined,
  });
}

export async function modifierConversation(
  conversationId: string,
  utilisateurId: string,
  action: "epingle" | "desepingle" | "archive" | "desarchive"
) {
  const participation = await prisma.participantConversation.findUnique({
    where: {
      conversationId_utilisateurId: { conversationId, utilisateurId },
    },
  });
  if (!participation) throw new Error("CONVERSATION_INACCESSIBLE");

  if (action === "epingle" || action === "desepingle") {
    return prisma.participantConversation.update({
      where: {
        conversationId_utilisateurId: { conversationId, utilisateurId },
      },
      data: { epinglePerso: action === "epingle" },
    });
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { archivee: action === "archive" },
  });
}

export async function ajouterParticipantsGroupe(
  conversationId: string,
  utilisateurId: string,
  participantIds: string[]
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  const existants = new Set(participants.map((p) => p.utilisateurId));
  const nouveaux = [...new Set(participantIds)].filter(
    (id) => id !== utilisateurId && !existants.has(id)
  );

  if (nouveaux.length === 0) {
    throw new Error("AUCUN_NOUVEAU_PARTICIPANT");
  }

  await prisma.participantConversation.createMany({
    data: nouveaux.map((id) => ({
      conversationId,
      utilisateurId: id,
      role: "MEMBRE" as const,
    })),
    skipDuplicates: true,
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { ajoutes: nouveaux.length, ids: nouveaux };
}

async function obtenirContexteGroupe(conversationId: string, utilisateurId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });

  if (!conversation || conversation.type !== "GROUPE") {
    throw new Error("TYPE_INVALIDE");
  }

  const participation = conversation.participants.find(
    (p) => p.utilisateurId === utilisateurId
  );
  if (!participation) throw new Error("CONVERSATION_INACCESSIBLE");

  return { conversation, participation, participants: conversation.participants };
}

/** Promouvoir le créateur legacy s'il n'est pas encore admin (groupes antérieurs). */
async function assurerAdminGroupe(
  conversationId: string,
  createurId: string | null,
  participants: { utilisateurId: string; role: string }[],
  utilisateurId: string
) {
  const moi = participants.find((p) => p.utilisateurId === utilisateurId);
  if (!moi) throw new Error("CONVERSATION_INACCESSIBLE");
  if (moi.role === "ADMIN") return;

  if (createurId === utilisateurId) {
    await prisma.participantConversation.update({
      where: {
        conversationId_utilisateurId: { conversationId, utilisateurId },
      },
      data: { role: "ADMIN" },
    });
    return;
  }

  throw new Error("NON_ADMIN_GROUPE");
}

function compterAdmins(participants: { role: string }[]) {
  return participants.filter((p) => p.role === "ADMIN").length;
}

export async function retirerParticipantGroupe(
  conversationId: string,
  utilisateurId: string,
  participantId: string
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  if (participantId === utilisateurId) {
    throw new Error("RETIRER_SOI_INTERDIT");
  }

  const cible = participants.find((p) => p.utilisateurId === participantId);
  if (!cible) throw new Error("PARTICIPANT_INTROUVABLE");

  if (cible.role === "ADMIN" && compterAdmins(participants) <= 1) {
    throw new Error("DERNIER_ADMIN");
  }

  await prisma.participantConversation.delete({
    where: {
      conversationId_utilisateurId: {
        conversationId,
        utilisateurId: participantId,
      },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return { retires: 1 };
}

export async function promouvoirAdminGroupe(
  conversationId: string,
  utilisateurId: string,
  participantId: string
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  const cible = participants.find((p) => p.utilisateurId === participantId);
  if (!cible) throw new Error("PARTICIPANT_INTROUVABLE");
  if (cible.role === "ADMIN") throw new Error("DEJA_ADMIN");

  await prisma.participantConversation.update({
    where: {
      conversationId_utilisateurId: {
        conversationId,
        utilisateurId: participantId,
      },
    },
    data: { role: "ADMIN" },
  });

  return { ok: true };
}

export async function retirerAdminGroupe(
  conversationId: string,
  utilisateurId: string,
  participantId: string
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  const cible = participants.find((p) => p.utilisateurId === participantId);
  if (!cible) throw new Error("PARTICIPANT_INTROUVABLE");
  if (cible.role !== "ADMIN") throw new Error("PAS_ADMIN");

  if (compterAdmins(participants) <= 1) {
    throw new Error("DERNIER_ADMIN");
  }

  await prisma.participantConversation.update({
    where: {
      conversationId_utilisateurId: {
        conversationId,
        utilisateurId: participantId,
      },
    },
    data: { role: "MEMBRE" },
  });

  return { ok: true };
}

export async function renommerGroupe(
  conversationId: string,
  utilisateurId: string,
  sujet: string
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  const nom = sujet.trim();
  if (!nom) throw new Error("SUJET_REQUIS");

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { sujet: nom, updatedAt: new Date() },
  });

  return { sujet: nom };
}

export async function modifierPhotoGroupe(
  conversationId: string,
  utilisateurId: string,
  photoUrl: string | null
) {
  const { conversation, participants } = await obtenirContexteGroupe(conversationId, utilisateurId);
  await assurerAdminGroupe(conversationId, conversation.createurId, participants, utilisateurId);

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { photoUrl, updatedAt: new Date() },
  });

  return { photoUrl };
}

export async function supprimerMessage(messageId: string, utilisateurId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      expediteurId: true,
      conversationId: true,
      contenu: true,
      contenuArchive: true,
    },
  });
  if (!message || message.expediteurId !== utilisateurId) {
    throw new Error("NON_AUTORISE");
  }

  await prisma.$transaction([
    prisma.pieceJointe.deleteMany({ where: { messageId } }),
    prisma.reactionMessage.deleteMany({ where: { messageId } }),
    prisma.message.update({
      where: { id: messageId },
      data: {
        supprime: true,
        contenuArchive: message.contenuArchive ?? message.contenu,
        contenu: "",
        modifieLe: null,
        supprimeLe: new Date(),
      },
    }),
  ]);

  await publierRedis(CANAUX_REDIS.messagerie, {
    event: EVENEMENTS_SOCKET.MESSAGE_SUPPRIME,
    conversationId: message.conversationId,
    messageId,
    portee: "tous",
  });

  return { id: messageId, supprime: true };
}

async function verifierAccesMessage(messageId: string, utilisateurId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: { include: { participants: true } } },
  });
  if (!message) throw new Error("MESSAGE_INTROUVABLE");
  const participant = message.conversation.participants.some(
    (p) => p.utilisateurId === utilisateurId
  );
  if (!participant) throw new Error("NON_AUTORISE");
  return message;
}

export async function masquerMessagePourMoi(messageId: string, utilisateurId: string) {
  await verifierAccesMessage(messageId, utilisateurId);
  return prisma.messageMasque.upsert({
    where: {
      messageId_utilisateurId: { messageId, utilisateurId },
    },
    update: { masqueLe: new Date() },
    create: { messageId, utilisateurId },
  });
}

export async function modifierMessageContenu(
  messageId: string,
  utilisateurId: string,
  contenu: string
) {
  const texte = contenu.trim();
  if (!texte) throw new Error("CONTENU_VIDE");

  const message = await verifierAccesMessage(messageId, utilisateurId);
  if (message.expediteurId !== utilisateurId) throw new Error("NON_AUTORISE");
  if (message.supprime) throw new Error("MESSAGE_SUPPRIME");

  const limiteMs = 15 * 60 * 1000;
  if (Date.now() - message.envoyeLe.getTime() > limiteMs) {
    throw new Error("DELAI_MODIFICATION_DEPASSE");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { contenu: texte, modifieLe: new Date() },
  });
}

export async function basculerEpingleMessage(messageId: string, utilisateurId: string) {
  await verifierAccesMessage(messageId, utilisateurId);
  const existante = await prisma.reactionMessage.findFirst({
    where: { messageId, utilisateurId, emoji: "EPINGLE" },
  });
  if (existante) {
    await prisma.reactionMessage.deleteMany({
      where: { messageId, utilisateurId, emoji: "EPINGLE" },
    });
    return { epingle: false };
  }
  await prisma.reactionMessage.create({
    data: { messageId, utilisateurId, emoji: "EPINGLE" },
  });
  return { epingle: true };
}

export async function transfererMessage(
  messageId: string,
  utilisateurId: string,
  conversationCibleId: string
) {
  const message = await verifierAccesMessage(messageId, utilisateurId);
  const participation = await prisma.participantConversation.findUnique({
    where: {
      conversationId_utilisateurId: {
        conversationId: conversationCibleId,
        utilisateurId,
      },
    },
  });
  if (!participation) throw new Error("CONVERSATION_INACCESSIBLE");

  const expediteur = await prisma.utilisateur.findUnique({
    where: { id: message.expediteurId },
    select: { prenom: true, nom: true },
  });
  const nomExp = expediteur ? `${expediteur.prenom} ${expediteur.nom}` : "—";
  const contenuTransfere = message.supprime
    ? MARQUEUR_TRANSFERT_INDISPONIBLE
    : formaterContenuTransfere(nomExp, message.contenu);

  const { envoyerMessage } = await import("@/lib/messagerie/envoyer-message");
  return envoyerMessage(conversationCibleId, utilisateurId, {
    contenu: contenuTransfere,
    metadonnees: { transfereDe: messageId },
  });
}

export async function ajouterReaction(
  messageId: string,
  utilisateurId: string,
  emoji: "POUCES" | "COEUR" | "CHECK" | "EPINGLE" | "RIRE" | "SURPRISE"
) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: { include: { participants: true } } },
  });
  if (!message) throw new Error("MESSAGE_INTROUVABLE");

  const participant = message.conversation.participants.some(
    (p) => p.utilisateurId === utilisateurId
  );
  if (!participant) throw new Error("NON_AUTORISE");

  return prisma.reactionMessage.upsert({
    where: {
      messageId_utilisateurId_emoji: {
        messageId,
        utilisateurId,
        emoji,
      },
    },
    update: {},
    create: { messageId, utilisateurId, emoji },
  });
}

export async function retirerReaction(
  messageId: string,
  utilisateurId: string,
  emoji: "POUCES" | "COEUR" | "CHECK" | "EPINGLE" | "RIRE" | "SURPRISE"
) {
  return prisma.reactionMessage.deleteMany({
    where: { messageId, utilisateurId, emoji },
  });
}

export async function rechercherMessagerie(
  utilisateurId: string,
  q: string,
  options?: { dateDebut?: string; dateFin?: string }
) {
  const terme = q.trim();
  if (!terme) return { conversations: [], messages: [] };

  const participations = await prisma.participantConversation.findMany({
    where: { utilisateurId, conversation: { patientId: null } },
    select: { conversationId: true },
  });
  const ids = participations.map((p) => p.conversationId);

  const messages = await prisma.message.findMany({
    where: {
      conversationId: { in: ids },
      supprime: false,
      ...(terme ? { contenu: { contains: terme, mode: "insensitive" as const } } : {}),
      conversation: { patientId: null },
      ...(options?.dateDebut
        ? { envoyeLe: { gte: new Date(options.dateDebut) } }
        : {}),
      ...(options?.dateFin ? { envoyeLe: { lte: new Date(options.dateFin) } } : {}),
    },
    include: {
      expediteur: { select: { prenom: true, nom: true } },
      conversation: { select: { id: true, sujet: true, type: true } },
    },
    orderBy: { envoyeLe: "desc" },
    take: 50,
  });

  return { messages };
}

/** Extrait les mentions @prenom.nom dans le contenu */
export function extraireMentions(contenu: string): string[] {
  const regex = /@([a-zA-ZÀ-ÿ]+)\.([a-zA-ZÀ-ÿ]+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = regex.exec(contenu)) !== null) {
    mentions.push(`${match[1]}.${match[2]}`.toLowerCase());
  }
  return [...new Set(mentions)];
}

export async function resoudreMentions(contenu: string) {
  const mentions = extraireMentions(contenu);
  if (mentions.length === 0) return [];

  const utilisateurs = await prisma.utilisateur.findMany({
    where: { statut: "ACTIF" },
    select: { id: true, prenom: true, nom: true },
  });

  return utilisateurs.filter((u) =>
    mentions.includes(`${u.prenom}.${u.nom}`.toLowerCase())
  );
}

export async function notifierMentions(
  messageId: string,
  destinataireIds: string[],
  expediteurNom: string,
  conversationId: string
) {
  await Promise.all(
    destinataireIds.map((utilisateurId) =>
      creerNotification({
        utilisateurId,
        type: "MENTION",
        titre: "Mention dans une conversation",
        message: `${expediteurNom} vous a mentionné.`,
        lien: lienMessagerieReception(conversationId),
        entite: "message",
        entiteId: messageId,
        metadonnees: metadonneesNotificationI18n("MENTION", { expediteur: expediteurNom }),
      })
    )
  );
}
