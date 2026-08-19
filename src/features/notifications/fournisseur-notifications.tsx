"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { useSocketSigh } from "@/hooks/use-socket-sigh";
import {
  EVENT_COMPTEUR_NOTIFICATIONS,
  EVENT_NOUVELLE_NOTIFICATION,
  EVENT_RAFRAICHIR_NOTIFICATIONS,
} from "@/features/notifications/utilitaires-notifications";

const vues = new Set<string>();

function dejaSignalee(id: string | null | undefined): boolean {
  if (!id) return false;
  if (vues.has(id)) return true;
  vues.add(id);
  if (vues.size > 120) {
    const premier = vues.values().next().value;
    if (premier) vues.delete(premier);
  }
  return false;
}

function publierNouvelle(payload: Record<string, unknown>) {
  const id =
    typeof payload.notificationId === "string"
      ? payload.notificationId
      : typeof payload.id === "string"
        ? payload.id
        : null;
  if (dejaSignalee(id)) return;
  window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
  window.dispatchEvent(
    new CustomEvent(EVENT_NOUVELLE_NOTIFICATION, { detail: payload })
  );
}

/**
 * Socket temps réel + filet de secours HTTP.
 * En production : toast et son dès qu’une alerte / un message / un transfert arrive.
 */
export function FournisseurNotifications({ children }: { children: ReactNode }) {
  const connecteRef = useRef(false);
  const premierPassage = useRef(true);

  const { connecte } = useSocketSigh({
    onNotification: (payload) => {
      publierNouvelle((payload ?? {}) as Record<string, unknown>);
    },
    onConnexion: () => {
      connecteRef.current = true;
    },
    onDeconnexion: () => {
      connecteRef.current = false;
    },
  });

  useEffect(() => {
    connecteRef.current = connecte;
  }, [connecte]);

  const verifier = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/non-lues", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        total?: number;
        derniere?: {
          id: string;
          type: string;
          titre: string;
          message: string;
          lien: string | null;
        } | null;
      };
      window.dispatchEvent(
        new CustomEvent(EVENT_COMPTEUR_NOTIFICATIONS, {
          detail: { total: data.total ?? 0 },
        })
      );
      const d = data.derniere;
      if (premierPassage.current) {
        premierPassage.current = false;
        if (d?.id) dejaSignalee(d.id);
        return;
      }
      if (!d?.id) return;
      publierNouvelle({
        notificationId: d.id,
        type: d.type,
        titre: d.titre,
        message: d.message,
        lien: d.lien,
      });
    } catch {
      /* réseau */
    }
  }, []);

  useEffect(() => {
    void verifier();
    let timer: ReturnType<typeof setInterval> | undefined;
    const planifier = () => {
      if (timer) clearInterval(timer);
      const ms = connecteRef.current ? 12000 : 3000;
      timer = setInterval(() => void verifier(), ms);
    };
    planifier();
    const onVisibilite = () => {
      if (document.visibilityState === "visible") void verifier();
    };
    const onLigne = () => void verifier();
    document.addEventListener("visibilitychange", onVisibilite);
    window.addEventListener("online", onLigne);
    const onSocket = () => {
      planifier();
      void verifier();
    };
    window.addEventListener("sigh:socket-reconnect", onSocket);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilite);
      window.removeEventListener("online", onLigne);
      window.removeEventListener("sigh:socket-reconnect", onSocket);
    };
  }, [verifier, connecte]);

  return <>{children}</>;
}
