"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EVENT_COMPTEUR_NOTIFICATIONS,
  EVENT_RAFRAICHIR_NOTIFICATIONS,
} from "@/features/notifications/utilitaires-notifications";

export function useNotificationsLive() {
  const [totalNonLues, setTotalNonLues] = useState(0);
  const [chargement, setChargement] = useState(true);

  const rafraichir = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/non-lues");
      if (!res.ok) return;
      const data = (await res.json()) as { total: number };
      setTotalNonLues(data.total);
    } finally {
      setChargement(false);
    }
  }, []);

  const signalerRafraichissement = useCallback(() => {
    window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
  }, []);

  useEffect(() => {
    void rafraichir();
    const handler = () => void rafraichir();
    const compteur = (e: Event) => {
      const total = (e as CustomEvent<{ total?: number }>).detail?.total;
      if (typeof total === "number") {
        setTotalNonLues(total);
        setChargement(false);
      }
    };
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
    window.addEventListener(EVENT_COMPTEUR_NOTIFICATIONS, compteur);
    return () => {
      window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
      window.removeEventListener(EVENT_COMPTEUR_NOTIFICATIONS, compteur);
    };
  }, [rafraichir]);

  return { totalNonLues, chargement, rafraichir, signalerRafraichissement };
}
