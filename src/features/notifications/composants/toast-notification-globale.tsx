"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { traduireNotification } from "@/features/notifications/traduire-notification";
import {
  EVENT_NOUVELLE_NOTIFICATION,
  styleTypeNotification,
} from "@/features/notifications/utilitaires-notifications";
import type { NotificationItem } from "@/features/notifications/composants/carte-notification";
import { cn } from "@/lib/utils";

interface ToastActif {
  id: string;
  titre: string;
  message: string;
  type: NotificationItem["type"];
  lien: string | null;
}

export function ToastNotificationGlobale() {
  const { t, i18n } = useTranslation();
  const [toast, setToast] = useState<ToastActif | null>(null);

  const afficherDerniere = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?filtre=non_lus");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: NotificationItem[] };
      const derniere = data.notifications[0];
      if (!derniere) return;
      const { titre, message } = traduireNotification(derniere, t);
      setToast({
        id: derniere.id,
        titre,
        message,
        type: derniere.type,
        lien: derniere.lien,
      });
    } catch {
      /* silencieux */
    }
  }, [t]);

  useEffect(() => {
    const handler = () => void afficherDerniere();
    window.addEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
    i18n.on("languageChanged", handler);
    return () => {
      window.removeEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
      i18n.off("languageChanged", handler);
    };
  }, [afficherDerniere, i18n]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const style = styleTypeNotification(toast.type);
  const Icon = style.Icon;

  return (
    <div className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[60] flex justify-center lg:bottom-6 lg:left-auto lg:right-6 lg:justify-end">
      <div
        role="alert"
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl transition-all",
          style.bordure
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            style.fond,
            style.texte
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-texte-principal">{toast.titre}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-texte-secondaire">{toast.message}</p>
          {toast.lien && (
            <a
              href={toast.lien}
              className="mt-2 inline-block text-xs font-semibold text-bleu-medical hover:underline"
            >
              {t("reception.notificationsCentre.voir")}
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="shrink-0 rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair"
          aria-label={t("reception.messagerie.annuler")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
