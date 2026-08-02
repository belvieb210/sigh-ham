"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { redirigerSiSessionInvalide } from "@/lib/auth/rediriger-session-invalide";
import { EVENEMENTS_SOCKET } from "@/lib/realtime/evenements";

const URL_SOCKET = process.env.NEXT_PUBLIC_SOCKET_URL;

export function useSocketSigh(options?: {
  onNouveauMessage?: (payload: unknown) => void;
  onMessageSupprime?: (payload: unknown) => void;
  onNotification?: (payload: unknown) => void;
  onPresence?: (payload: unknown) => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    if (!URL_SOCKET) return;

    const socket = io(URL_SOCKET, {
      path: "/socket.io",
      withCredentials: true,
      // polling d'abord : plus fiable derrière Apache (upgrade WS ensuite)
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 8000,
    });

    socketRef.current = socket;

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

  return { rejoindreConversation, quitterConversation, envoyerTyping };
}
