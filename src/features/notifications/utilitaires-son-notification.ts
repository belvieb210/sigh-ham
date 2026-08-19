"use client";

import type { TypeNotification } from "@/generated/prisma/enums";

let audioContext: AudioContext | null = null;
let debloque = false;

function contexteAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

/** Débloque l’audio après un geste utilisateur (politique autoplay des navigateurs). */
export function debloquerAudioNotifications() {
  if (debloque) return;
  debloque = true;
  const ctx = contexteAudio();
  if (ctx?.state === "suspended") void ctx.resume();
}

export function installerDeblocageAudio() {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => debloquerAudioNotifications();
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  return () => {
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
  };
}

type FamilleSon = "message" | "transfert" | "stock" | "defaut";

export function familleSonNotification(type?: string | null): FamilleSon {
  switch (type) {
    case "NOUVEAU_MESSAGE":
    case "MENTION":
    case "NOUVEAU_GROUPE":
      return "message";
    case "PATIENT_TRANSFERE":
    case "DEMANDE_TRANSFERT":
    case "PATIENT_EN_ATTENTE":
      return "transfert";
    case "STOCK_FAIBLE":
    case "STOCK_EPUISE":
    case "MEDICAMENT_EXPIRATION":
      return "stock";
    default:
      return "defaut";
  }
}

function bip(
  ctx: AudioContext,
  freq: number,
  debut: number,
  duree: number,
  volume: number,
  type: OscillatorType = "sine"
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime + debut);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + debut);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + debut + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + debut + duree);
  oscillator.start(ctx.currentTime + debut);
  oscillator.stop(ctx.currentTime + debut + duree + 0.02);
}

/** Sons distincts selon le type (message, transfert, alerte stock). */
export function jouerSonNotification(type?: TypeNotification | string | null) {
  const ctx = contexteAudio();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
    const famille = familleSonNotification(type);
    if (famille === "message") {
      bip(ctx, 880, 0, 0.12, 0.14, "sine");
      bip(ctx, 1174, 0.14, 0.16, 0.16, "sine");
      return;
    }
    if (famille === "transfert") {
      bip(ctx, 523, 0, 0.1, 0.12, "triangle");
      bip(ctx, 659, 0.12, 0.1, 0.13, "triangle");
      bip(ctx, 784, 0.24, 0.16, 0.15, "triangle");
      return;
    }
    if (famille === "stock") {
      bip(ctx, 440, 0, 0.18, 0.2, "square");
      bip(ctx, 349, 0.22, 0.22, 0.22, "square");
      bip(ctx, 440, 0.48, 0.28, 0.2, "square");
      return;
    }
    bip(ctx, 880, 0, 0.08, 0.15, "sine");
    bip(ctx, 660, 0.1, 0.16, 0.12, "sine");
  } catch {
    /* autoplay bloqué ou API indisponible */
  }
}
