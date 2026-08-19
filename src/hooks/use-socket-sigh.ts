"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { redirigerSiSessionInvalide } from "@/lib/auth/rediriger-session-invalide";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";

/** En production, /socket.io est proxifié sur le même domaine (Apache). */
function urlSocket(): string | undefined {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_SOCKET_URL;
  const env = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  const hote = window.location.hostname;
  const enLocal = hote === "localhost" || hote === "127.0.0.1";
  if (!enLocal && (!env || /localhost|127\.0\.0\.1/i.test(env))) {
    return window.location.origin;
  }
  return env || window.location.origin;
}

export function useSocketSigh(options?: {
  onNouveauMessage?: (payload: unknown) => void;
  onMessageSupprime?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
  onPresence?: (payload: unknown) => void;
  onConnexion?: () => void;
  onDeconnexion?: () => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    const url = urlSocket();
    if (!url) return;

    const socket = io(url, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 8000,
      timeout: 12000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnecte(true);
      optsRef.current?.onConnexion?.();
    });
    socket.on("disconnect", () => {
      setConnecte(false);
      optsRef.current?.onDeconnexion?.();
    });
    socket.on("connect_error", () => {
      setConnecte(false);
    });

    socket.on(EVENEMENTS_SOCKET.NOUVEAU_MESSAGE, (p) => {
      optsRef.current?.onNouveauMessage?.(p);
    });
    socket.on(EVENEMENTS_SOCKET.MESSAGE_SUPPRIME, (p) => {
      optsRef.current?.onMessageSupprime?.(p);
    });
    socket.on(EVENEMENTS_SOCKET.NOUVELLE_NOTIFICATION, (p) => {
      optsRef.current?.onNotification?.(p);
    });
    socket.on(EVENEMENTS_SOCKET.PRESENCE, (p) => {
      optsRef.current?.onPresence?.(p);
    });

    const mettreAJourPresence = (statut: "EN_LIGNE" | "HORS_LIGNE") => {
      void fetch("/api/messagerie/presence", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      })
        .then((res) => redirigerSiSessionInvalide(res))
        .catch(() => {});
    };

    const demarrage = window.setTimeout(() => mettreAJourPresence("EN_LIGNE"), 150);
    const interval = setInterval(() => mettreAJourPresence("EN_LIGNE"), 60000);

    return () => {
      clearTimeout(demarrage);
      clearInterval(interval);
      mettreAJourPresence("HORS_LIGNE");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const rejoindreConversation = (conversationId: string) => {
    socketRef.current?.emit("rejoindre_conversation", conversationId);
  };

  const quitterConversation = (conversationId: string) => {
    socketRef.current?.emit("quitter_conversation", conversationId);
  };

  const envoyerTyping = (conversationId: string) => {
    socketRef.current?.emit(EVENEMENTS_SOCKET.TYPING, { conversationId });
  };

  return {
    connecte,
    rejoindreConversation,
    quitterConversation,
    envoyerTyping,
  };
}
