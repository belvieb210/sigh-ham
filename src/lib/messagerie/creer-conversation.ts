import "server-only";
import { prisma } from "@/lib/prisma";
import { libelleConversation } from "@/lib/messagerie/libelles";
import type { PayloadCreerConversation } from "@/lib/messagerie/types";

export async function creerConversation(
  utilisateurId: string,
  payload: PayloadCreerConversation
) {
  if (payload.type === "DIRECT") {
    const autreId = payload.participantIds?.[0];
    if (!autreId || autreId === utilisateurId) {
      throw new Error("PARTICIPANT_REQUIS");
    }

    const existante = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { utilisateurId } } },
          { participants: { some: { utilisateurId: autreId } } },
        ],
      },
      include: {
        participants: {
          include: { utilisateur: { include: { role: true } } },
        },
      },
    });

    if (existante) {
      const participants = existante.participants.map((p) => ({
        id: p.utilisateur.id,
        prenom: p.utilisateur.prenom,
        nom: p.utilisateur.nom,
        role: p.utilisateur.role.nom,
        roleGroupe: p.role,
      }));

      return {
        id: existante.id,
        existante: true,
        ...libelleConversation(
          existante.type,
          existante.sujet,
          existante.salleCode,
          participants,
          utilisateurId
        ),
      };
    }

    if (!payload.premierMessage?.trim()) {
      throw new Error("PREMIER_MESSAGE_REQUIS");
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        createurId: utilisateurId,
        participants: {
          create: [
            { utilisateurId, role: "ADMIN" },
            { utilisateurId: autreId, role: "MEMBRE" },
          ],
        },
        ...(payload.premierMessage
          ? {
              messages: {
                create: {
                  expediteurId: utilisateurId,
                  contenu: payload.premierMessage.trim(),
                  priorite: payload.prioritePremierMessage ?? "NORMALE",
                  lectures: { create: { utilisateurId } },
                },
              },
            }
          : {}),
      },
    });

    return { id: conversation.id, existante: false, libelle: "Message direct", sousTitre: null };
  }

  if (payload.type === "GROUPE") {
    const sujet = payload.sujet?.trim();
    if (!sujet) {
      throw new Error("SUJET_REQUIS");
    }

    const ids = [...new Set([utilisateurId, ...(payload.participantIds ?? [])])];
    if (ids.length < 2) {
      throw new Error("PARTICIPANTS_REQUIS");
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: "GROUPE",
        sujet,
        photoUrl: payload.photoUrl ?? null,
        categorieGroupe: payload.categorieGroupe ?? "GENERAL",
        createurId: utilisateurId,
        participants: {
          create: ids.map((id) => ({
            utilisateurId: id,
            role: id === utilisateurId ? "ADMIN" : "MEMBRE",
          })),
        },
        ...(payload.premierMessage
          ? {
              messages: {
                create: {
                  expediteurId: utilisateurId,
                  contenu: payload.premierMessage.trim(),
                  priorite: payload.prioritePremierMessage ?? "NORMALE",
                  lectures: { create: { utilisateurId } },
                },
              },
            }
          : {}),
      },
    });

    return {
      id: conversation.id,
      existante: false,
      libelle: payload.sujet?.trim() || "Groupe de travail",
      sousTitre: `${ids.length} participants`,
    };
  }

  if (payload.type === "CANAL_SALLE" && payload.salleCode) {
    const canal = await prisma.conversation.findFirst({
      where: { type: "CANAL_SALLE", salleCode: payload.salleCode },
    });
    if (!canal) throw new Error("CANAL_INTROUVABLE");
    return { id: canal.id, existante: true, libelle: payload.salleCode, sousTitre: null };
  }

  throw new Error("TYPE_INVALIDE");
}

export async function listerContactsMessagerie(
  utilisateurId: string,
  recherche?: string
) {
  const terme = recherche?.trim();

  const utilisateurs = await prisma.utilisateur.findMany({
    where: {
      id: { not: utilisateurId },
      statut: "ACTIF",
      ...(terme
        ? {
            OR: [
              { prenom: { contains: terme, mode: "insensitive" as const } },
              { nom: { contains: terme, mode: "insensitive" as const } },
              { identifiant: { contains: terme, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      role: { include: { salle: true } },
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    take: terme ? 30 : 200,
  });

  return utilisateurs.map((u) => ({
    id: u.id,
    prenom: u.prenom,
    nom: u.nom,
    role: u.role.nom,
    salleCode: u.role.salle?.code ?? null,
    salleNom: u.role.salle?.nom ?? null,
  }));
}

export async function envoyerMessageConversationDirecte(
  utilisateurId: string,
  autreId: string,
  payload: import("@/lib/messagerie/types").PayloadEnvoiMessage,
  conversationIdForce?: string
) {
  if (!autreId || autreId === utilisateurId) {
    throw new Error("PARTICIPANT_REQUIS");
  }

  const contenu = payload.contenu?.trim();
  const aFichier = payload.fichiers && payload.fichiers.length > 0;
  if (!contenu && !aFichier) {
    throw new Error("CONTENU_VIDE");
  }

  let conversationId = conversationIdForce;
  let conversationCreee = false;

  if (!conversationId) {
    const existante = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { participants: { some: { utilisateurId } } },
          { participants: { some: { utilisateurId: autreId } } },
        ],
      },
      select: { id: true },
    });
    conversationId = existante?.id;
  }

  if (!conversationId) {
    const conversation = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        createurId: utilisateurId,
        participants: {
          create: [
            { utilisateurId, role: "ADMIN" },
            { utilisateurId: autreId, role: "MEMBRE" },
          ],
        },
      },
    });
    conversationId = conversation.id;
    conversationCreee = true;
  }

  try {
    const { envoyerMessage } = await import("@/lib/messagerie/envoyer-message");
    const message = await envoyerMessage(conversationId, utilisateurId, payload);
    return { conversationId, message };
  } catch (error) {
    if (conversationCreee) {
      const nbMessages = await prisma.message.count({ where: { conversationId } });
      if (nbMessages === 0) {
        await prisma.conversation.delete({ where: { id: conversationId } }).catch(() => {});
      }
    }
    throw error;
  }
}
