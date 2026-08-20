import "server-only";
import type { Prisma, TypeConversation } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/admin/audit";
import type {
  CategorieFeedModeration,
  ElementFeedModeration,
  StatutElementModeration,
  StatsModeration,
} from "@/lib/admin/moderation-messagerie-types";

export type {
  CategorieFeedModeration,
  ElementFeedModeration,
  StatutElementModeration,
  StatsModeration,
} from "@/lib/admin/moderation-messagerie-types";

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

function initialesDepuisNom(nom: string) {
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function statutMessage(m: {
  signale: boolean;
  bloque: boolean;
  supprime: boolean;
  avertissementEnvoye: boolean;
}): StatutElementModeration {
  if (m.supprime) return "supprime";
  if (m.bloque) return "bloque";
  if (m.signale && !m.avertissementEnvoye) return "nouveau";
  if (m.signale || m.avertissementEnvoye) return "en_cours";
  return "resolu";
}

function statutConversation(c: {
  bloquee: boolean;
  supprimee: boolean;
}): StatutElementModeration {
  if (c.supprimee) return "supprime";
  if (c.bloquee) return "bloque";
  return "en_cours";
}

function filtrerParRecherche(items: ElementFeedModeration[], q?: string) {
  const terme = q?.trim().toLowerCase();
  if (!terme) return items;
  return items.filter(
    (item) =>
      item.titre.toLowerCase().includes(terme) ||
      item.auteur.toLowerCase().includes(terme) ||
      item.contenu.toLowerCase().includes(terme) ||
      (item.raison?.toLowerCase().includes(terme) ?? false) ||
      (item.conversationSujet?.toLowerCase().includes(terme) ?? false)
  );
}

function filtrerParStatut(items: ElementFeedModeration[], statut?: string) {
  if (!statut || statut === "tous") return items;
  return items.filter((item) => item.statut === statut);
}

export async function listerFeedModeration(opts: {
  categorie?: CategorieFeedModeration;
  q?: string;
  statut?: string;
  page?: number;
  pageSize?: number;
}) {
  const categorie = opts.categorie ?? "tous";
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 10, 5), 50);
  const items: ElementFeedModeration[] = [];

  const inclureMessages =
    categorie === "tous" || categorie === "messages";
  const inclureConversations =
    categorie === "tous" || categorie === "conversations";
  const inclureGroupes = categorie === "tous" || categorie === "groupes";
  const inclureFichiers = categorie === "tous" || categorie === "fichiers";
  const inclureSuspensions =
    categorie === "tous" || categorie === "suspensions";

  if (inclureMessages) {
    const messages = await listerMessagesModeration({
      signales: categorie === "messages" ? true : undefined,
      limite: categorie === "messages" ? 200 : 80,
    });
    for (const m of messages) {
      if (categorie === "tous" && !m.signale && !m.bloque && !m.supprime) continue;
      items.push({
        id: `msg-${m.id}`,
        kind: "message",
        titre: m.expediteur.nomComplet,
        initiales: initialesDepuisNom(m.expediteur.nomComplet),
        auteur: m.expediteur.nomComplet,
        auteurId: m.expediteur.id,
        auteurIdentifiant: m.expediteur.identifiant,
        contenu: m.contenu,
        raison: m.signaleRaison ?? m.bloqueRaison,
        statut: statutMessage(m),
        dateIso: m.envoyeLe,
        conversationId: m.conversationId,
        conversationSujet: m.conversationSujet,
        messageId: m.id,
        fichierUrl: null,
        fichierMime: null,
        estImage: false,
        bloque: m.bloque,
        supprime: m.supprime,
        signale: m.signale,
        avertissementEnvoye: m.avertissementEnvoye,
      });
    }
  }

  if (inclureConversations) {
    const conversations = await listerConversationsModeration({
      bloquees: categorie === "conversations" ? true : undefined,
      limite: 80,
    });
    for (const c of conversations) {
      if (c.type === "GROUPE") continue;
      if (categorie === "tous" && !c.bloquee) continue;
      items.push({
        id: `conv-${c.id}`,
        kind: "conversation",
        titre: c.sujet || "Conversation privée",
        initiales: initialesDepuisNom(c.sujet || "CV"),
        auteur: c.createur ?? "—",
        auteurId: null,
        auteurIdentifiant: null,
        contenu: c.dernierMessage ?? "—",
        raison: c.bloqueeRaison,
        statut: statutConversation(c),
        dateIso: c.dernierMessageLe ?? c.updatedAt,
        conversationId: c.id,
        conversationSujet: c.sujet,
        messageId: null,
        fichierUrl: null,
        fichierMime: null,
        estImage: false,
        bloque: c.bloquee,
        supprime: c.supprimee,
        signale: false,
        avertissementEnvoye: false,
      });
    }
  }

  if (inclureGroupes) {
    const groupes = await listerConversationsModeration({
      type: "GROUPE",
      limite: 80,
    });
    for (const g of groupes) {
      if (categorie === "tous" && !g.supprimee && !g.bloquee) continue;
      items.push({
        id: `grp-${g.id}`,
        kind: "groupe",
        titre: g.sujet || "Groupe",
        initiales: initialesDepuisNom(g.sujet || "GR"),
        auteur: g.createur ?? "—",
        auteurId: null,
        auteurIdentifiant: null,
        contenu: g.dernierMessage ?? `${g.nbParticipants} participants`,
        raison: g.bloqueeRaison,
        statut: statutConversation(g),
        dateIso: g.dernierMessageLe ?? g.updatedAt,
        conversationId: g.id,
        conversationSujet: g.sujet,
        messageId: null,
        fichierUrl: null,
        fichierMime: null,
        estImage: false,
        bloque: g.bloquee,
        supprime: g.supprimee,
        signale: false,
        avertissementEnvoye: false,
      });
    }
  }

  if (inclureFichiers) {
    const fichiers = await listerFichiersModeration({ limite: 80 });
    for (const f of fichiers) {
      items.push({
        id: `file-${f.id}`,
        kind: "fichier",
        titre: f.nom,
        initiales: "PJ",
        auteur: f.expediteur ?? "—",
        auteurId: null,
        auteurIdentifiant: null,
        contenu: f.conversationSujet ?? f.nom,
        raison: f.signaleRaison,
        statut: f.supprimee ? "supprime" : f.signalee ? "nouveau" : "en_cours",
        dateIso: f.envoyeLe,
        conversationId: f.conversationId,
        conversationSujet: f.conversationSujet,
        messageId: f.messageId,
        fichierUrl: f.url,
        fichierMime: f.mimeType,
        estImage: f.estImage,
        bloque: false,
        supprime: f.supprimee,
        signale: f.signalee,
        avertissementEnvoye: false,
      });
    }
  }

  if (inclureSuspensions) {
    const suspensions = await listerSuspensionsModeration({ limite: 80 });
    for (const u of suspensions) {
      items.push({
        id: `usr-${u.id}`,
        kind: "suspension",
        titre: u.nomComplet,
        initiales: initialesDepuisNom(u.nomComplet),
        auteur: u.nomComplet,
        auteurId: u.id,
        auteurIdentifiant: u.identifiant,
        contenu: u.notesAdmin ?? "Accès messagerie suspendu par l'administration.",
        raison: "Suspension messagerie",
        statut: "suspendu",
        dateIso: u.updatedAt,
        conversationId: null,
        conversationSujet: null,
        messageId: null,
        fichierUrl: null,
        fichierMime: null,
        estImage: false,
        bloque: true,
        supprime: false,
        signale: false,
        avertissementEnvoye: false,
      });
    }
  }

  const filtres = filtrerParStatut(filtrerParRecherche(items, opts.q), opts.statut);
  filtres.sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );

  const total = filtres.length;
  const debut = (page - 1) * pageSize;
  const elements = filtres.slice(debut, debut + pageSize);

  return { elements, total, page, pageSize };
}

export async function listerSuspensionsModeration(opts?: {
  q?: string;
  limite?: number;
}) {
  const limite = Math.min(opts?.limite ?? 50, 100);
  const where: Prisma.UtilisateurWhereInput = { messagerieBloquee: true };
  if (opts?.q?.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { identifiant: { contains: q, mode: "insensitive" } },
      { prenom: { contains: q, mode: "insensitive" } },
      { nom: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.utilisateur.findMany({
    where,
    select: {
      id: true,
      prenom: true,
      nom: true,
      identifiant: true,
      notesAdmin: true,
      updatedAt: true,
      role: { select: { nom: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limite,
  });

  return rows.map((u) => ({
    id: u.id,
    nomComplet: `${u.prenom} ${u.nom}`.trim(),
    identifiant: u.identifiant,
    role: u.role.nom,
    notesAdmin: u.notesAdmin,
    updatedAt: u.updatedAt.toISOString(),
  }));
}

export async function approuverSignalementMessageAdmin(
  acteurId: string,
  messageId: string
) {
  const msg = await prisma.message.update({
    where: { id: messageId },
    data: { signale: false, signaleRaison: null },
  });
  await actionAudit(acteurId, "Approbation signalement message", "Message", messageId);
  return msg;
}

export async function supprimerMessagePourTousAdmin(
  acteurId: string,
  messageId: string
) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error("INTROUVABLE");
  const maj = await prisma.message.update({
    where: { id: messageId },
    data: {
      supprime: true,
      supprimeLe: new Date(),
      contenuArchive: msg.contenuArchive ?? msg.contenu,
      contenu: "[Message supprimé par l'administration]",
      signale: false,
      signaleRaison: null,
    },
  });
  await actionAudit(acteurId, "Suppression message (admin)", "Message", messageId);
  return maj;
}

export async function approuverSignalementFichierAdmin(
  acteurId: string,
  fichierId: string
) {
  const f = await prisma.pieceJointe.update({
    where: { id: fichierId },
    data: { signalee: false, signaleRaison: null },
  });
  await actionAudit(acteurId, "Approbation signalement fichier", "PieceJointe", fichierId);
  return f;
}

export async function supprimerFichierAdmin(acteurId: string, fichierId: string) {
  const f = await prisma.pieceJointe.update({
    where: { id: fichierId },
    data: {
      supprimee: true,
      supprimeeLe: new Date(),
      signalee: false,
      signaleRaison: null,
    },
  });
  await actionAudit(acteurId, "Suppression fichier (admin)", "PieceJointe", fichierId);
  return f;
}
