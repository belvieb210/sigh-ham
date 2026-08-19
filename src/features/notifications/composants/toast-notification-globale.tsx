"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { traduireNotification } from "@/features/notifications/traduire-notification";
import {
  EVENT_NOUVELLE_NOTIFICATION,
  familleSonNotification,
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

const DUREE_MS: Record<string, number> = {
  stock: 10000,
  transfert: 7000,
  message: 6000,
  defaut: 5500,
};

export function ToastNotificationGlobale() {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ToastActif[]>([]);

  const pousser = useCallback((toast: ToastActif) => {
    setToasts((prev) => [toast, ...prev.filter((x) => x.id !== toast.id)].slice(0, 3));
  }, []);

  const retirer = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const afficherDepuisSocket = useCallback(
    async (detail: Record<string, unknown> | undefined) => {
      const type = (detail?.type as NotificationItem["type"] | undefined) ?? undefined;
      const titreSocket = typeof detail?.titre === "string" ? detail.titre : "";
      const messageSocket = typeof detail?.message === "string" ? detail.message : "";
      const id =
        typeof detail?.notificationId === "string"
          ? detail.notificationId
          : `tmp-${Date.now()}`;

      if (titreSocket && type) {
        const { titre, message } = traduireNotification(
          {
            type,
            titre: titreSocket,
            message: messageSocket,
            metadonnees: null,
          },
          t
        );
        pousser({
          id,
          titre,
          message,
          type,
          lien: typeof detail?.lien === "string" ? detail.lien : null,
        });
        return;
      }

      try {
        const res = await fetch("/api/notifications?filtre=non_lus");
        if (!res.ok) return;
        const data = (await res.json()) as { notifications: NotificationItem[] };
        const derniere = data.notifications[0];
        if (!derniere) return;
        const { titre, message } = traduireNotification(derniere, t);
        pousser({
          id: derniere.id,
          titre,
          message,
          type: derniere.type,
          lien: derniere.lien,
        });
      } catch {
        /* silencieux */
      }
    },
    [pousser, t]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      void afficherDepuisSocket(detail);
    };
    window.addEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
    return () => window.removeEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
  }, [afficherDepuisSocket]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => {
      const famille = familleSonNotification(toast.type);
      const duree = DUREE_MS[famille] ?? DUREE_MS.defaut;
      return window.setTimeout(() => retirer(toast.id), duree);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, retirer]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-[70] flex w-[min(100%-1.5rem,24rem)] flex-col gap-2 lg:right-6">
      {toasts.map((toast) => {
        const style = styleTypeNotification(toast.type);
        const Icon = style.Icon;
        const urgent = familleSonNotification(toast.type) === "stock";
        return (
          <div
            key={toast.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl",
              style.bordure,
              urgent && "ring-2 ring-red-400/70"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                style.fond,
                style.texte
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-texte-secondaire">
                {t(`reception.notificationsCentre.types.${toast.type}`, toast.type)}
              </p>
              <p className="mt-0.5 text-sm font-bold text-texte-principal">{toast.titre}</p>
              <p className="mt-0.5 line-clamp-3 text-xs text-texte-secondaire">{toast.message}</p>
              {toast.lien ? (
                <a
                  href={toast.lien}
                  className="mt-2 inline-block text-xs font-semibold text-bleu-medical hover:underline"
                >
                  {t("reception.notificationsCentre.voir")}
                </a>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => retirer(toast.id)}
              className="shrink-0 rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair"
              aria-label={t("reception.messagerie.annuler")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
