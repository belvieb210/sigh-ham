import type { TFunction } from "i18next";
import type { TypeNotification } from "@/generated/prisma/enums";
import { traduireContenuMessage } from "@/features/messagerie/traduire-contenu-message";

export interface NotificationAffichable {
  type: TypeNotification;
  titre: string;
  message: string;
  metadonnees?: Record<string, unknown> | null;
}

function paramsDepuisMetadonnees(
  meta: Record<string, unknown> | null | undefined,
  t: TFunction
): Record<string, string> {
  if (!meta) return {};
  const params: Record<string, string> = {};
  for (const [cle, val] of Object.entries(meta)) {
    if (cle.startsWith("cle")) continue;
    if (typeof val === "string" || typeof val === "number") {
      const brut = String(val);
      params[cle] =
        cle === "apercu" ? traduireContenuMessage(brut, t) : brut;
    }
  }
  return params;
}

/** Titre et message traduits selon la langue active (templates i18n + repli texte stocké). */
export function traduireNotification(
  notification: NotificationAffichable,
  t: TFunction
): { titre: string; message: string } {
  const meta = (notification.metadonnees ?? {}) as Record<string, unknown>;
  const params = paramsDepuisMetadonnees(meta, t);

  const cleTitre =
    (typeof meta.cleTitre === "string" && meta.cleTitre) ||
    `reception.notificationsCentre.messages.${notification.type}.titre`;
  const cleMessage =
    (typeof meta.cleMessage === "string" && meta.cleMessage) ||
    `reception.notificationsCentre.messages.${notification.type}.message`;

  const titreTraduit = t(cleTitre, {
    ...params,
    defaultValue: notification.titre,
  });
  const messageTraduit = t(cleMessage, {
    ...params,
    defaultValue: notification.message,
  });

  return { titre: titreTraduit, message: messageTraduit };
}
