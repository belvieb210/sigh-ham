import type { TFunction } from "i18next";
import {
  ArrowRightLeft,
  Bell,
  Megaphone,
  MessageSquare,
  UserPlus,
  AtSign,
  type LucideIcon,
} from "lucide-react";
import type { TypeNotification } from "@/generated/prisma/enums";

export const EVENT_RAFRAICHIR_NOTIFICATIONS = "sigh:notifications-refresh";
export const EVENT_NOUVELLE_NOTIFICATION = "sigh:notifications-nouvelle";

export interface StyleTypeNotification {
  Icon: LucideIcon;
  fond: string;
  texte: string;
  bordure: string;
}

export function styleTypeNotification(type: TypeNotification): StyleTypeNotification {
  switch (type) {
    case "NOUVEAU_MESSAGE":
      return {
        Icon: MessageSquare,
        fond: "bg-blue-100",
        texte: "text-blue-700",
        bordure: "border-blue-200",
      };
    case "MENTION":
      return {
        Icon: AtSign,
        fond: "bg-indigo-100",
        texte: "text-indigo-700",
        bordure: "border-indigo-200",
      };
    case "DIFFUSION":
      return {
        Icon: Megaphone,
        fond: "bg-purple-100",
        texte: "text-purple-700",
        bordure: "border-purple-200",
      };
    case "NOUVEAU_PATIENT":
      return {
        Icon: UserPlus,
        fond: "bg-emerald-100",
        texte: "text-emerald-700",
        bordure: "border-emerald-200",
      };
    case "PATIENT_TRANSFERE":
    case "PATIENT_EN_ATTENTE":
    case "DEMANDE_TRANSFERT":
      return {
        Icon: ArrowRightLeft,
        fond: "bg-amber-100",
        texte: "text-amber-700",
        bordure: "border-amber-200",
      };
    default:
      return {
        Icon: Bell,
        fond: "bg-slate-100",
        texte: "text-slate-700",
        bordure: "border-slate-200",
      };
  }
}

export function formaterTempsRelatif(iso: string, locale: string, t?: TFunction): string {
  const date = new Date(iso);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return t ? t("reception.notificationsCentre.temps.maintenant") : "À l'instant";
  }
  if (diffMin < 60) {
    return t
      ? t("reception.notificationsCentre.temps.minutes", { count: diffMin })
      : `Il y a ${diffMin} min`;
  }

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) {
    return t
      ? t("reception.notificationsCentre.temps.heures", { count: diffH })
      : `Il y a ${diffH} h`;
  }

  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) {
    return t ? t("reception.notificationsCentre.temps.hier") : "Hier";
  }
  if (diffJ < 7) {
    return t
      ? t("reception.notificationsCentre.temps.jours", { count: diffJ })
      : `Il y a ${diffJ} j`;
  }

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function lienMessagerieReception(conversationId: string): string {
  return `/sigh/reception/messagerie?conversation=${encodeURIComponent(conversationId)}`;
}
