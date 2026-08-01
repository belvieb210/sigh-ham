import "server-only";
import { prisma } from "@/lib/prisma";
import { libelleConversation } from "@/lib/messagerie/libelles";
import type { ConversationResume, FiltreConversation } from "@/lib/messagerie/types";
import { assurerParticipationUtilisateur } from "@/lib/messagerie/canaux-salles";

function mapperParticipant(p: {
  role: "ADMIN" | "MEMBRE";
  utilisateur: {
    id: string;
    prenom: string;
    nom: string;
    role: { nom: string };
  };
}) {
  return {
    id: p.utilisateur.id,
    prenom: p.utilisateur.prenom,
    nom: p.utilisateur.nom,
    role: p.utilisateur.role.nom,
    roleGroupe: p.role,
  };
}

export async function listerConversations(
  utilisateurId: string,
  salleCodeUtilisateur: string | null,
  options?: { filtre?: FiltreConversation; recherche?: string }
): Promise<ConversationResume[]> {
  await assurerParticipationUtilisateur(
    utilisateurId,
    salleCodeUtilisateur as Parameters<typeof assurerParticipationUtilisateur>[1]
  );

  const participations = await prisma.participantConversation.findMany({
    where: {
      utilisateurId,
      conversation: { archivee: false, patientId: null },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              utilisateur: {
                include: { role: true },
              },
            },
          },
          messages: {
            where: { supprime: false },
            orderBy: { envoyeLe: "desc" },
            take: 1,
            include: {
              expediteur: true,
              lectures: true,
            },
          },
        },
      },
    },
  });

  let resultat = participations.map(({ conversation, epinglePerso }) => {
    const participants = conversation.participants.map((p) =>
      mapperParticipant(p)
    );

    const dernier = conversation.messages[0] ?? null;

    return {
      id: conversation.id,
      type: conversation.type,
      sujet: conversation.sujet,
      photoUrl: conversation.photoUrl,
      salleCode: conversation.salleCode,
      epingle: conversation.epingle,
      epinglePerso,
      nonLus: 0,
      dernierMessage: dernier
        ? {
            id: dernier.id,
            contenu: dernier.supprime ? "" : dernier.contenu,
            envoyeLe: dernier.envoyeLe.toISOString(),
            expediteurNom: `${dernier.expediteur.prenom} ${dernier.expediteur.nom}`,
            priorite: dernier.priorite,
            supprime: dernier.supprime,
          }
        : null,
      participants,
      ...libelleConversation(
        conversation.type,
        conversation.sujet,
        conversation.salleCode,
        participants,
        utilisateurId
      ),
    } satisfies ConversationResume;
  });

  const ids = resultat.map((c) => c.id);
  if (ids.length > 0) {
    const comptes = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: ids },
        expediteurId: { not: utilisateurId },
        supprime: false,
        lectures: { none: { utilisateurId } },
      },
      _count: { id: true },
    });

    const mapNonLus = new Map(comptes.map((r) => [r.conversationId, r._count.id]));
    resultat = resultat.map((c) => ({
      ...c,
      nonLus: mapNonLus.get(c.id) ?? 0,
    }));
  }

  const filtre = options?.filtre ?? "tous";
  const recherche = options?.recherche?.trim().toLowerCase();

  if (filtre === "non_lus") {
    resultat = resultat.filter((c) => c.nonLus > 0);
  } else if (filtre === "canaux") {
    resultat = resultat.filter((c) => c.type === "CANAL_SALLE");
  } else if (filtre === "directs") {
    resultat = resultat.filter((c) => c.type === "DIRECT");
  } else if (filtre === "groupes") {
    resultat = resultat.filter((c) => c.type === "GROUPE");
  } else if (filtre === "epingles") {
    resultat = resultat.filter((c) => c.epingle || c.epinglePerso);
  }

  if (recherche) {
    resultat = resultat.filter(
      (c) =>
        c.sujet?.toLowerCase().includes(recherche) ||
        c.salleCode?.toLowerCase().includes(recherche) ||
        c.participants.some(
          (p) =>
            p.prenom.toLowerCase().includes(recherche) ||
            p.nom.toLowerCase().includes(recherche) ||
            p.role.toLowerCase().includes(recherche)
        ) ||
        c.dernierMessage?.contenu.toLowerCase().includes(recherche) ||
        c.libelle.toLowerCase().includes(recherche) ||
        c.sousTitre?.toLowerCase().includes(recherche)
    );
  }

  resultat = resultat.filter(
    (c) => c.type !== "DIRECT" || c.dernierMessage !== null
  );

  resultat.sort((a, b) => {
    const epingleA = a.epingle || a.epinglePerso ? 1 : 0;
    const epingleB = b.epingle || b.epinglePerso ? 1 : 0;
    if (epingleA !== epingleB) return epingleB - epingleA;
    if (a.nonLus !== b.nonLus) return b.nonLus - a.nonLus;
    const dateA = a.dernierMessage?.envoyeLe ?? "";
    const dateB = b.dernierMessage?.envoyeLe ?? "";
    return dateB.localeCompare(dateA);
  });

  return resultat;
}

export async function obtenirConversationDirecte(
  utilisateurId: string,
  autreId: string
): Promise<ConversationResume | null> {
  const participation = await prisma.participantConversation.findFirst({
    where: {
      utilisateurId,
      conversation: {
        type: "DIRECT",
        archivee: false,
        participants: { some: { utilisateurId: autreId } },
      },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              utilisateur: { include: { role: true } },
            },
          },
          messages: {
            where: { supprime: false },
            orderBy: { envoyeLe: "desc" },
            take: 1,
            include: {
              expediteur: true,
              lectures: true,
            },
          },
        },
      },
    },
  });

  if (!participation) return null;

  const { conversation, epinglePerso } = participation;
  const participants = conversation.participants.map((p) =>
    mapperParticipant(p)
  );
  const dernier = conversation.messages[0] ?? null;

  return {
    id: conversation.id,
    type: conversation.type,
    sujet: conversation.sujet,
    photoUrl: conversation.photoUrl,
    salleCode: conversation.salleCode,
    epingle: conversation.epingle,
    epinglePerso,
    nonLus: 0,
    dernierMessage: dernier
      ? {
          id: dernier.id,
          contenu: dernier.supprime ? "" : dernier.contenu,
          envoyeLe: dernier.envoyeLe.toISOString(),
          expediteurNom: `${dernier.expediteur.prenom} ${dernier.expediteur.nom}`,
          priorite: dernier.priorite,
          supprime: dernier.supprime,
        }
      : null,
    participants,
    ...libelleConversation(
      conversation.type,
      conversation.sujet,
      conversation.salleCode,
      participants,
      utilisateurId
    ),
  };
}
