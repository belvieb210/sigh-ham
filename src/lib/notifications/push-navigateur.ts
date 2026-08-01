import "server-only";
import { prisma } from "@/lib/prisma";

export interface DonneesPushNotification {
  utilisateurId: string;
  titre: string;
  message: string;
  lien?: string | null;
  notificationId?: string;
}

/** Envoie une notification push navigateur si VAPID et abonnements configurés. */
export async function envoyerPushNavigateur(donnees: DonneesPushNotification) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;

  const prefs = await prisma.preferenceNotification.findUnique({
    where: { utilisateurId: donnees.utilisateurId },
  });
  if (prefs && (!prefs.push || prefs.silencieux)) return;

  const abonnements = await prisma.abonnementPush.findMany({
    where: { utilisateurId: donnees.utilisateurId },
  });
  if (abonnements.length === 0) return;

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch {
    console.warn("[push] Module web-push absent — exécutez: npm install web-push");
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@sigh.local",
    publicKey,
    privateKey
  );

  const payload = JSON.stringify({
    titre: donnees.titre,
    message: donnees.message,
    lien: donnees.lien ?? null,
    notificationId: donnees.notificationId ?? null,
  });

  await Promise.allSettled(
    abonnements.map(async (ab) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: ab.endpoint,
            keys: { p256dh: ab.p256dh, auth: ab.auth },
          },
          payload
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.abonnementPush.delete({ where: { id: ab.id } }).catch(() => undefined);
        }
      }
    })
  );
}

export async function enregistrerAbonnementPush(
  utilisateurId: string,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  userAgent?: string
) {
  return prisma.abonnementPush.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      utilisateurId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
    update: {
      utilisateurId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
  });
}

export async function supprimerAbonnementPush(utilisateurId: string, endpoint: string) {
  return prisma.abonnementPush.deleteMany({
    where: { utilisateurId, endpoint },
  });
}
