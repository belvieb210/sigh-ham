"use client";

import { useCallback, useEffect, useState } from "react";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";

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
    const interval = setInterval(rafraichir, 30000);
    const handler = () => void rafraichir();
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, handler);
    };
  }, [rafraichir]);

  return { totalNonLues, chargement, rafraichir, signalerRafraichissement };
}
