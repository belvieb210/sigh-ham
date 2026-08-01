"use client";

import { useCallback, useEffect } from "react";

const SW_PATH = "/sw-notifications.js";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function useNotificationsPush(actif: boolean) {
  const synchroniserAbonnement = useCallback(async () => {
    if (!actif || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        });
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        }),
      });
    } catch (err) {
      console.warn("[push] Abonnement impossible:", err);
    }
  }, [actif]);

  const desabonner = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch("/api/notifications/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
    } catch {
      /* silencieux */
    }
  }, []);

  useEffect(() => {
    if (actif) void synchroniserAbonnement();
    else void desabonner();
  }, [actif, synchroniserAbonnement, desabonner]);

  return { synchroniserAbonnement, desabonner };
}

/** Notification navigateur native (onglet actif ou arrière-plan). */
export function afficherNotificationNavigateur(params: {
  titre: string;
  message: string;
  lien?: string | null;
  tag?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  const notification = new Notification(params.titre, {
    body: params.message,
    icon: "/favicon.ico",
    tag: params.tag ?? "sigh-in-app",
  });
  notification.onclick = () => {
    window.focus();
    if (params.lien) window.location.href = params.lien;
    notification.close();
  };
}
