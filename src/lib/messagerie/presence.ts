import "server-only";
import { prisma } from "@/lib/prisma";
import type { StatutPresence } from "@/generated/prisma/enums";
import { publierRedis, CANAUX_REDIS } from "@/lib/redis/client";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";

export async function mettreAJourPresence(
  utilisateurId: string,
  statut: StatutPresence,
  messageStatut?: string
) {
  const presence = await prisma.presenceUtilisateur.upsert({
    where: { utilisateurId },
    update: { statut, messageStatut, dernierPing: new Date() },
    create: { utilisateurId, statut, messageStatut },
    include: {
      utilisateur: { select: { prenom: true, nom: true } },
    },
  });

  await publierRedis(CANAUX_REDIS.presence, {
    event: EVENEMENTS_SOCKET.PRESENCE,
    utilisateurId,
    statut,
    prenom: presence.utilisateur.prenom,
    nom: presence.utilisateur.nom,
  });

  return presence;
}

export async function listerPresences(utilisateurIds: string[]) {
  if (utilisateurIds.length === 0) return [];
  return prisma.presenceUtilisateur.findMany({
    where: { utilisateurId: { in: utilisateurIds } },
  });
}

export async function pingPresence(utilisateurId: string) {
  return mettreAJourPresence(utilisateurId, "EN_LIGNE");
}
