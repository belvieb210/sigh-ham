import "server-only";
import { prisma } from "@/lib/prisma";
import type { CodeSalle, TypeNotification, CanalNotification } from "@/generated/prisma/enums";
import { publierRedis, CANAUX_REDIS } from "@/lib/redis/client";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";

export interface DonneesNotification {
  utilisateurId: string;
  type: TypeNotification;
  titre: string;
  message: string;
  module?: CodeSalle;
  entite?: string;
  entiteId?: string;
  lien?: string;
  canal?: CanalNotification;
  metadonnees?: Record<string, unknown>;
}

export async function creerNotification(donnees: DonneesNotification) {
  const prefs = await prisma.preferenceNotification.findUnique({
    where: { utilisateurId: donnees.utilisateurId },
  });

  if (prefs?.silencieux) return null;
  if (prefs?.typesSilencieux?.includes(donnees.type)) return null;

  const canal = donnees.canal ?? "IN_APP";
  if (canal === "IN_APP" && prefs && !prefs.inApp) return null;

  const notification = await prisma.notification.create({
    data: {
      utilisateurId: donnees.utilisateurId,
      type: donnees.type,
      canal,
      titre: donnees.titre,
      message: donnees.message,
      module: donnees.module,
      entite: donnees.entite,
      entiteId: donnees.entiteId,
      lien: donnees.lien,
      metadonnees: donnees.metadonnees ? (donnees.metadonnees as object) : undefined,
    },
  });

  await publierRedis(CANAUX_REDIS.notifications, {
    event: EVENEMENTS_SOCKET.NOUVELLE_NOTIFICATION,
    utilisateurId: donnees.utilisateurId,
    notificationId: notification.id,
    type: notification.type,
    titre: notification.titre,
    message: notification.message,
    lien: notification.lien,
  });

  void import("@/lib/notifications/push-navigateur").then(({ envoyerPushNavigateur }) =>
    envoyerPushNavigateur({
      utilisateurId: donnees.utilisateurId,
      titre: donnees.titre,
      message: donnees.message,
      lien: donnees.lien,
      notificationId: notification.id,
    })
  );

  return notification;
}

/** Notifie tous les utilisateurs actifs d'une salle */
export async function notifierSalle(
  salleCode: CodeSalle,
  donnees: Omit<DonneesNotification, "utilisateurId">
) {
  const utilisateurs = await prisma.utilisateur.findMany({
    where: {
      statut: "ACTIF",
      role: { salle: { code: salleCode } },
    },
    select: { id: true },
  });

  const resultats = await Promise.all(
    utilisateurs.map((u) =>
      creerNotification({ ...donnees, utilisateurId: u.id, module: salleCode })
    )
  );

  return resultats.filter(Boolean).length;
}

/** Notifie tous les utilisateurs actifs (diffusion admin) */
export async function notifierTous(
  donnees: Omit<DonneesNotification, "utilisateurId">
) {
  const utilisateurs = await prisma.utilisateur.findMany({
    where: { statut: "ACTIF" },
    select: { id: true },
  });

  await Promise.all(
    utilisateurs.map((u) =>
      creerNotification({ ...donnees, utilisateurId: u.id, type: "DIFFUSION" })
    )
  );

  return utilisateurs.length;
}

export async function compterNotificationsNonLues(utilisateurId: string) {
  return prisma.notification.count({
    where: { utilisateurId, lu: false, archivee: false },
  });
}

export async function apercuNotificationsNonLues(utilisateurId: string) {
  const [total, derniere] = await Promise.all([
    compterNotificationsNonLues(utilisateurId),
    prisma.notification.findFirst({
      where: { utilisateurId, lu: false, archivee: false },
      orderBy: { creeLe: "desc" },
      select: {
        id: true,
        type: true,
        titre: true,
        message: true,
        lien: true,
      },
    }),
  ]);
  return { total, derniere };
}

export async function listerNotifications(
  utilisateurId: string,
  options?: { filtre?: "tous" | "non_lus" | "archives"; type?: TypeNotification; q?: string }
) {
  return prisma.notification.findMany({
    where: {
      utilisateurId,
      ...(options?.filtre === "non_lus" ? { lu: false, archivee: false } : {}),
      ...(options?.filtre === "archives" ? { archivee: true } : { archivee: false }),
      ...(options?.type ? { type: options.type } : {}),
      ...(options?.q
        ? {
            OR: [
              { titre: { contains: options.q, mode: "insensitive" as const } },
              { message: { contains: options.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { creeLe: "desc" },
    take: 100,
  });
}

export async function marquerNotificationLue(id: string, utilisateurId: string) {
  return prisma.notification.updateMany({
    where: { id, utilisateurId },
    data: { lu: true, luLe: new Date() },
  });
}

export async function marquerToutesNotificationsLues(utilisateurId: string) {
  return prisma.notification.updateMany({
    where: { utilisateurId, lu: false },
    data: { lu: true, luLe: new Date() },
  });
}

export async function archiverNotification(id: string, utilisateurId: string) {
  return prisma.notification.updateMany({
    where: { id, utilisateurId },
    data: { archivee: true },
  });
}
