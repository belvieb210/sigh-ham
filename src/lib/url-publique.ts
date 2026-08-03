/**
 * Origine publique du site (QR, liens reçus).
 * Derrière Apache/Nginx, `request.url` pointe souvent vers localhost:3000 —
 * on privilégie NEXT_PUBLIC_APP_URL puis les en-têtes X-Forwarded-*.
 */

const ORIGINE_FALLBACK = "https://hamlab5.duckdns.org";

function estHoteLocal(hote: string): boolean {
  const h = hote.toLowerCase();
  return (
    h === "localhost" ||
    h.startsWith("localhost:") ||
    h === "127.0.0.1" ||
    h.startsWith("127.0.0.1:") ||
    h === "0.0.0.0" ||
    h.startsWith("0.0.0.0:")
  );
}

export function obtenirOriginePublique(request?: Request): string {
  const depuisEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (depuisEnv) {
    try {
      if (!estHoteLocal(new URL(depuisEnv).host)) return depuisEnv;
    } catch {
      /* ignore URL invalide */
    }
  }

  if (request) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.split(",")[0]?.trim();

    if (host && !estHoteLocal(host)) {
      return `${proto}://${host}`;
    }

    try {
      const u = new URL(request.url);
      if (!estHoteLocal(u.host)) return u.origin;
    } catch {
      /* ignore */
    }
  }

  return depuisEnv || ORIGINE_FALLBACK;
}
