import "server-only";
import type { TypeNotification } from "@/generated/prisma/enums";

const PREFIX = "reception.notificationsCentre.messages";

export function metadonneesNotificationI18n(
  type: TypeNotification,
  params: Record<string, string | number | undefined>
): Record<string, unknown> {
  const nettoyes: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) nettoyes[k] = String(v);
  }
  return {
    cleTitre: `${PREFIX}.${type}.titre`,
    cleMessage: `${PREFIX}.${type}.message`,
    ...nettoyes,
  };
}
