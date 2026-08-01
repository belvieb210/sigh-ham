"use client";

import { type ReactNode } from "react";
import { useSocketSigh } from "@/hooks/use-socket-sigh";
import {
  EVENT_NOUVELLE_NOTIFICATION,
  EVENT_RAFRAICHIR_NOTIFICATIONS,
} from "@/features/notifications/utilitaires-notifications";

/** Connexion socket unique pour toute la réception — évite les doublons. */
export function FournisseurNotifications({ children }: { children: ReactNode }) {
  useSocketSigh({
    onNotification: (payload) => {
      window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
      window.dispatchEvent(
        new CustomEvent(EVENT_NOUVELLE_NOTIFICATION, { detail: payload })
      );
    },
  });

  return children;
}
