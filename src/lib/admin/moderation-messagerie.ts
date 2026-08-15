import "server-only";
import type { Prisma, TypeConversation } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";

export type VueModeration = "conversations" | "messages" | "supprimes" | "groupes" | "fichiers" | "signales";

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

export async function obtenirStatsModeration(): Promise<StatsModeration> {
  const [
    conversationsTotal,
    conversationsBloquees,
    groupesSupprimes,
    messagesSupprimes,
    messagesSignales,
    messagesBloques,
    fichiersSignales,
    fichiersSupprimes,
    utilisateursMessagerieBloquee,
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { bloquee: true } }),
    prisma.conversation.count({ where: { supprimee: true, type: "GROUPE" } }),
    prisma.message.count({ where: { supprime: true } }),
    prisma.message.count({ where: { signale: true } }),
    prisma.message.count({ where: { bloque: true } }),
    prisma.pieceJointe.count({ where: { signalee: true } }),
    prisma.pieceJointe.count({ where: { supprimee: true } }),
    prisma.utilisateur.count({ where: { messagerieBloquee: true } }),
  ]);
  return {
    conversationsTotal,
    conversationsBloquees,
    groupesSupprimes,
    messagesSupprimes,
    messagesSignales,
    messagesBloques,
    fichiersSignales,
    fichiersSupprimes,
    utilisateursMessagerieBloquee,
  };
}

export async function listerConversationsModeration(opts?: {
  q?: string;
  bloquees?: boolean;
  supprimees?: boolean;
  type?: TypeConversation;
  limite?: number;
}) {
  const limite = Math.min(opts?.limite ?? 50, 100);
  const where: Prisma.ConversationWhereInput = {};
  if (opts?.bloquees) where.bloquee = true;
  if (opts?.supprimees) where.supprimee = true;
  if (opts?.type) where.type = opts.type;
  if (opts?.q?.trim()) {
    where.sujet = { contains: opts.q.trim(), mode: "insensitive" };
  }

  const rows = await prisma.conversation.findMany({
    where,
    include: {
      createur: { select: { id: true, prenom: true, nom: true, identifiant: true } },
      _count: { select: { messages: true, participants: true } },
      messages: {
        orderBy: { envoyeLe: "desc" },
        take: 1,
        select: {
          contenu: true,
          supprime: true,
          contenuArchive: true,
          envoyeLe: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limite,
  });

  return rows.map((c) => {
    const dernier = c.messages[0];
    return {
      id: c.id,
      type: c.type,
      sujet: c.sujet,
      bloquee: c.bloquee,
      bloqueeLe: c.bloqueeLe?.toISOString() ?? null,
      bloqueeRaison: c.bloqueeRaison,
      supprimee: c.supprimee,
      supprimeeLe: c.supprimeeLe?.toISOString() ?? null,
      archivee: c.archivee,
      updatedAt: c.updatedAt.toISOString(),
      createur: c.createur
        ? `${c.createur.prenom} ${c.createur.nom}`.trim()
        : null,
      nbMessages: c._count.messages,
      nbParticipants: c._count.participants,
      dernierMessage: dernier
        ? dernier.supprime
          ? dernier.contenuArchive ?? "[supprimé]"
          : dernier.contenu
        : null,
      dernierMessageLe: dernier?.envoyeLe.toISOString() ?? null,
    };
  });
}

export async function listerMessagesModeration(opts?: {
  supprimes?: boolean;
  signales?: boolean;
  bloques?: boolean;
  limite?: number;
}) {
  const limite = Math.min(opts?.limite ?? 60, 120);
  const where: Prisma.MessageWhereInput = {};
  if (opts?.supprimes) where.supprime = true;
  if (opts?.signales) where.signale = true;
  if (opts?.bloques) where.bloque = true;
  if (!opts?.supprimes && !opts?.signales && !opts?.bloques) {
    where.OR = [{ supprime: true }, { signale: true }, { bloque: true }];
  }

  const rows = await prisma.message.findMany({
    where,
    include: {
      expediteur: { select: { id: true, prenom: true, nom: true, identifiant: true } },
      conversation: { select: { id: true, type: true, sujet: true } },
      piecesJointes: {
        select: {
          id: true,
          nom: true,
          mimeType: true,
          url: true,
          signalee: true,
          supprimee: true,
        },
      },
    },
    orderBy: { envoyeLe: "desc" },
    take: limite,
  });

  return rows.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    conversationType: m.conversation.type,
    conversationSujet: m.conversation.sujet,
    contenu: m.supprime ? m.contenuArchive ?? "[supprimé]" : m.contenu,
    contenuArchive: m.contenuArchive,
    supprime: m.supprime,
    supprimeLe: m.supprimeLe?.toISOString() ?? null,
    bloque: m.bloque,
    bloqueRaison: m.bloqueRaison,
    signale: m.signale,
    signaleRaison: m.signaleRaison,
    avertissementEnvoye: m.avertissementEnvoye,
    envoyeLe: m.envoyeLe.toISOString(),
    expediteur: {
      id: m.expediteur.id,
      nomComplet: `${m.expediteur.prenom} ${m.expediteur.nom}`.trim(),
      identifiant: m.expediteur.identifiant,
    },
    piecesJointes: m.piecesJointes,
  }));
}

export async function listerFichiersModeration(opts?: {
  signales?: boolean;
  supprimes?: boolean;
  limite?: number;
}) {
  const limite = Math.min(opts?.limite ?? 40, 80);
  const where: Prisma.PieceJointeWhereInput = {};
  if (opts?.signales) where.signalee = true;
  if (opts?.supprimes) where.supprimee = true;
  if (!opts?.signales && !opts?.supprimes) {
    where.OR = [{ signalee: true }, { supprimee: true }];
  }

  const rows = await prisma.pieceJointe.findMany({
    where,
    include: {
      message: {
        select: {
          id: true,
          conversationId: true,
          contenu: true,
          supprime: true,
          expediteur: { select: { id: true, prenom: true, nom: true, identifiant: true } },
          conversation: { select: { sujet: true, type: true } },
        },
      },
    },
    orderBy: { envoyeLe: "desc" },
    take: limite,
  });

  return rows.map((f) => ({
    id: f.id,
    nom: f.nom,
    mimeType: f.mimeType,
    taille: f.taille,
    url: f.url,
    type: f.type,
    signalee: f.signalee,
    signaleRaison: f.signaleRaison,
    supprimee: f.supprimee,
    supprimeeLe: f.supprimeeLe?.toISOString() ?? null,
    envoyeLe: f.envoyeLe.toISOString(),
    messageId: f.message.id,
    conversationId: f.message.conversationId,
    conversationSujet: f.message.conversation.sujet,
    expediteur: f.message.expediteur
      ? `${f.message.expediteur.prenom} ${f.message.expediteur.nom}`.trim()
      : null,
    estImage: f.mimeType.startsWith("image/"),
  }));
}

async function actionAudit(
  acteurId: string,
  action: string,
  entite: string,
  entiteId: string,
  details?: Record<string, unknown>
) {
  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "MODIFICATION",
    entite,
    entiteId,
    action,
    details,
  });
}

export async function bloquerConversationAdmin(
  acteurId: string,
  conversationId: string,
  raison?: string
) {
  const c = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      bloquee: true,
      bloqueeLe: new Date(),
      bloqueeParId: acteurId,
      bloqueeRaison: raison?.trim() || null,
    },
  });
  await actionAudit(acteurId, "Blocage conversation", "Conversation", conversationId, {
    raison,
  });
  return c;
}

export async function debloquerConversationAdmin(acteurId: string, conversationId: string) {
  const c = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      bloquee: false,
      bloqueeLe: null,
      bloqueeParId: null,
      bloqueeRaison: null,
    },
  });
  await actionAudit(acteurId, "Déblocage conversation", "Conversation", conversationId);
  return c;
}

export async function supprimerGroupeAdmin(acteurId: string, conversationId: string) {
  const c = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      supprimee: true,
      supprimeeLe: new Date(),
      supprimeeParId: acteurId,
    },
  });
  await actionAudit(acteurId, "Suppression groupe (admin)", "Conversation", conversationId);
  return c;
}

export async function restaurerGroupeAdmin(acteurId: string, conversationId: string) {
  const c = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      supprimee: false,
      supprimeeLe: null,
      supprimeeParId: null,
    },
  });
  await actionAudit(acteurId, "Restauration groupe", "Conversation", conversationId);
  return c;
}

export async function bloquerMessageAdmin(
  acteurId: string,
  messageId: string,
  raison?: string
) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error("INTROUVABLE");
  const archive = msg.contenuArchive ?? msg.contenu;
  const maj = await prisma.message.update({
    where: { id: messageId },
    data: {
      bloque: true,
      bloqueLe: new Date(),
      bloqueParId: acteurId,
      bloqueRaison: raison?.trim() || null,
      contenuArchive: archive,
      contenu: "[Message bloqué par l'administration]",
    },
  });
  await actionAudit(acteurId, "Blocage message", "Message", messageId, { raison });
  return maj;
}

export async function debloquerMessageAdmin(acteurId: string, messageId: string) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error("INTROUVABLE");
  const maj = await prisma.message.update({
    where: { id: messageId },
    data: {
      bloque: false,
      bloqueLe: null,
      bloqueParId: null,
      bloqueRaison: null,
      contenu: msg.contenuArchive ?? msg.contenu,
    },
  });
  await actionAudit(acteurId, "Déblocage message", "Message", messageId);
  return maj;
}

export async function envoyerAvertissementAdmin(
  acteurId: string,
  data: {
    destinataireId: string;
    contenu: string;
    messageId?: string;
    conversationId?: string;
  }
) {
  const contenu = data.contenu.trim();
  if (!contenu) throw new Error("CONTENU_REQUIS");

  const avert = await prisma.$transaction(async (tx) => {
    const cree = await tx.moderationAvertissement.create({
      data: {
        destinataireId: data.destinataireId,
        emetteurId: acteurId,
        messageId: data.messageId ?? null,
        conversationId: data.conversationId ?? null,
        contenu,
      },
    });
    if (data.messageId) {
      await tx.message.update({
        where: { id: data.messageId },
        data: { avertissementEnvoye: true },
      });
    }
    return cree;
  });

  await actionAudit(acteurId, "Avertissement modération", "Utilisateur", data.destinataireId, {
    messageId: data.messageId,
  });
  return avert;
}

export async function bloquerMessagerieUtilisateur(
  acteurId: string,
  utilisateurId: string,
  notes?: string
) {
  const u = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: {
      messagerieBloquee: true,
      ...(notes !== undefined ? { notesAdmin: notes.trim() || null } : {}),
    },
    select: { id: true, identifiant: true, messagerieBloquee: true },
  });
  await prisma.session.deleteMany({ where: { utilisateurId } });
  await actionAudit(acteurId, "Blocage messagerie utilisateur", "Utilisateur", utilisateurId);
  return u;
}

export async function debloquerMessagerieUtilisateur(acteurId: string, utilisateurId: string) {
  const u = await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { messagerieBloquee: false },
    select: { id: true, identifiant: true, messagerieBloquee: true },
  });
  await actionAudit(acteurId, "Déblocage messagerie utilisateur", "Utilisateur", utilisateurId);
  return u;
}

export function messageErreurModeration(code: string): string | null {
  switch (code) {
    case "INTROUVABLE":
      return "Élément introuvable.";
    case "CONTENU_REQUIS":
      return "Le message d'avertissement est obligatoire.";
    default:
      return null;
  }
}
