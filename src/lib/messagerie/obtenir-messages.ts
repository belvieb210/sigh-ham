import "server-only";
import { prisma } from "@/lib/prisma";
import type { MessageConversation } from "@/lib/messagerie/types";
import { mapperMessage } from "@/lib/messagerie/envoyer-message";
import { seuilExpirationMessageSupprime } from "@/lib/messagerie/message-supprime";

export async function obtenirMessagesConversation(
  conversationId: string,
  utilisateurId: string,
  options?: { avant?: string; limite?: number }
): Promise<{ messages: MessageConversation[]; aPlus: boolean }> {
  const participation = await prisma.participantConversation.findUnique({
    where: {
      conversationId_utilisateurId: { conversationId, utilisateurId },
    },
    include: {
      conversation: { select: { patientId: true } },
    },
  });

  if (!participation || participation.conversation.patientId !== null) {
    throw new Error("CONVERSATION_INACCESSIBLE");
  }

  const limite = Math.min(options?.limite ?? 50, 100);
  const seuilSuppression = seuilExpirationMessageSupprime();

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      masques: { none: { utilisateurId } },
      OR: [
        { supprime: false },
        { supprime: true, supprimeLe: { gt: seuilSuppression } },
        { supprime: true, supprimeLe: null, envoyeLe: { gt: seuilSuppression } },
      ],
      ...(options?.avant ? { envoyeLe: { lt: new Date(options.avant) } } : {}),
    },
    orderBy: { envoyeLe: "desc" },
    take: limite + 1,
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

  const aPlus = messages.length > limite;
  const tranche = aPlus ? messages.slice(0, limite) : messages;

  return {
    messages: tranche.reverse().map((m) => mapperMessage(m, utilisateurId)),
    aPlus,
  };
}
