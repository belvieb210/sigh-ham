"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  afficherNotificationNavigateur,
  useNotificationsPush,
} from "@/features/notifications/hooks/use-notifications-push";
import { traduireNotification } from "@/features/notifications/traduire-notification";
import type { NotificationItem } from "@/features/notifications/composants/carte-notification";
import { EVENT_NOUVELLE_NOTIFICATION } from "@/features/notifications/utilitaires-notifications";
import {
  installerDeblocageAudio,
  jouerSonNotification,
} from "@/features/notifications/utilitaires-son-notification";

interface PreferencesAlertes {
  push: boolean;
  son: boolean;
  silencieux: boolean;
}

/** Gère le son, les notifications navigateur et l'abonnement Web Push. */
export function GestionnaireAlertesNotifications() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<PreferencesAlertes>({
    push: false,
    son: true,
    silencieux: false,
  });

  useEffect(() => installerDeblocageAudio(), []);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { preferences?: PreferencesAlertes } | null) => {
        if (data?.preferences) setPrefs(data.preferences);
      })
      .catch(() => undefined);
  }, []);

  useNotificationsPush(prefs.push && !prefs.silencieux);

  const onNouvelle = useCallback(
    async (e: Event) => {
      if (prefs.silencieux) return;
      const detail = (e as CustomEvent<Record<string, unknown>>).detail;
      const type = typeof detail?.type === "string" ? detail.type : undefined;

      if (prefs.son) jouerSonNotification(type);

      const titreSocket = typeof detail?.titre === "string" ? detail.titre : "";
      const messageSocket = typeof detail?.message === "string" ? detail.message : "";
      if (titreSocket) {
        afficherNotificationNavigateur({
          titre: titreSocket,
          message: messageSocket,
          lien: typeof detail?.lien === "string" ? detail.lien : null,
          tag: typeof detail?.notificationId === "string" ? detail.notificationId : undefined,
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
        afficherNotificationNavigateur({
          titre,
          message,
          lien: derniere.lien,
          tag: derniere.id,
        });
      } catch {
        /* silencieux */
      }
    },
    [prefs.silencieux, prefs.son, t]
  );

  useEffect(() => {
    const handler = (e: Event) => void onNouvelle(e);
    window.addEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
    return () => window.removeEventListener(EVENT_NOUVELLE_NOTIFICATION, handler);
  }, [onNouvelle]);

  useEffect(() => {
    const handler = () => {
      fetch("/api/notifications/preferences")
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { preferences?: PreferencesAlertes } | null) => {
          if (data?.preferences) setPrefs(data.preferences);
        })
        .catch(() => undefined);
    };
    window.addEventListener("sigh:preferences-notifications", handler);
    return () => window.removeEventListener("sigh:preferences-notifications", handler);
  }, []);

  return null;
}
