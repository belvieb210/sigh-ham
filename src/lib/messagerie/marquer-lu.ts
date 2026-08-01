import "server-only";
import { prisma } from "@/lib/prisma";

export async function marquerConversationLue(
  conversationId: string,
  utilisateurId: string
) {
  const participation = await prisma.participantConversation.findUnique({
    where: {
      conversationId_utilisateurId: {
        conversationId,
        utilisateurId,
      },
    },
    include: {
      conversation: { select: { patientId: true } },
    },
  });

  if (!participation || participation.conversation.patientId !== null) {
    throw new Error("CONVERSATION_INACCESSIBLE");
  }

  const maintenant = new Date();

  const messagesNonLus = await prisma.message.findMany({
    where: {
      conversationId,
      expediteurId: { not: utilisateurId },
      supprime: false,
      lectures: { none: { utilisateurId } },
    },
    select: { id: true },
  });

  if (messagesNonLus.length > 0) {
    await prisma.messageLu.createMany({
      data: messagesNonLus.map((m) => ({
        messageId: m.id,
        utilisateurId,
        luLe: maintenant,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.participantConversation.update({
    where: {
      conversationId_utilisateurId: {
        conversationId,
        utilisateurId,
      },
    },
    data: { dernierLuLe: maintenant },
  });

  return { lu: messagesNonLus.length };
}

export async function compterMessagesNonLus(utilisateurId: string): Promise<number> {
  const result = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM messages m
    INNER JOIN participants_conversations pc ON pc.conversation_id = m.conversation_id
    INNER JOIN conversations c ON c.id = m.conversation_id
    LEFT JOIN messages_lus ml ON ml.message_id = m.id AND ml.utilisateur_id = ${utilisateurId}
    WHERE pc.utilisateur_id = ${utilisateurId}
      AND m.expediteur_id != ${utilisateurId}
      AND m.supprime = false
      AND c.archivee = false
      AND ml.message_id IS NULL
      AND (pc.dernier_lu_le IS NULL OR m.envoye_le > pc.dernier_lu_le)
  `;

  return Number(result[0]?.count ?? 0);
}
