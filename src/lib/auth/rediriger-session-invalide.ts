"use client";

/** Cookie présent mais session expirée (ex. après import DB) — nettoie et renvoie à la connexion. */
export async function redirigerSiSessionInvalide(reponse: Response) {
  if (reponse.status !== 401) return;

  try {
    await fetch("/api/auth/nettoyer-session", { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }

  const redirect = encodeURIComponent(
    window.location.pathname + window.location.search
  );
  window.location.replace(`/connexion?redirect=${redirect}`);
}
