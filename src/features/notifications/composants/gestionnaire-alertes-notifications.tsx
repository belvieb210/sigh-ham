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
import { jouerSonNotification } from "@/features/notifications/utilitaires-son-notification";

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

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { preferences?: PreferencesAlertes } | null) => {
        if (data?.preferences) setPrefs(data.preferences);
      })
      .catch(() => undefined);
  }, []);

  useNotificationsPush(prefs.push && !prefs.silencieux);

  const onNouvelle = useCallback(async () => {
    if (prefs.silencieux) return;

    if (prefs.son) jouerSonNotification();

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
  }, [prefs.silencieux, prefs.son, t]);

  useEffect(() => {
    const handler = () => void onNouvelle();
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
