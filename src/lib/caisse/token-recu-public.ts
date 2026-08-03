import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/** Validité du lien QR (2 ans) — le reçu reste scannable longtemps. */
const DUREE_TOKEN_SECONDES = 60 * 60 * 24 * 365 * 2;

function secretRecu(): string {
  return (
    process.env.RECU_PUBLIC_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.DATABASE_URL ||
    "sigh-ham-recu-public-v1"
  );
}

function signer(payload: string): string {
  return createHmac("sha256", secretRecu()).update(payload).digest("base64url");
}

function signaturesEgales(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * Jeton opaque liant le QR à une facture précise.
 * Séparateur `~` (évite les problèmes de « extension » avec `.` dans certains clients).
 */
export function creerTokenRecuFacture(factureId: string): string {
  const exp = Math.floor(Date.now() / 1000) + DUREE_TOKEN_SECONDES;
  const payload = Buffer.from(
    JSON.stringify({ f: factureId, e: exp, v: 2 }),
    "utf8"
  ).toString("base64url");
  return `${payload}~${signer(payload)}`;
}

function decouperToken(token: string): { payload: string; sig: string } | null {
  // v2: payload~sig — v1 (ancien): payload.sig
  if (token.includes("~")) {
    const i = token.indexOf("~");
    const payload = token.slice(0, i);
    const sig = token.slice(i + 1);
    return payload && sig ? { payload, sig } : null;
  }
  const i = token.indexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  return payload && sig ? { payload, sig } : null;
}

/** Retourne l'id facture si le jeton est valide, sinon null. */
export function verifierTokenRecuFacture(token: string): string | null {
  const parts = decouperToken(token.trim());
  if (!parts) return null;
  if (!signaturesEgales(parts.sig, signer(parts.payload))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(parts.payload, "base64url").toString("utf8")
    ) as { f?: string; e?: number };
    if (!data.f || typeof data.e !== "number") return null;
    if (data.e < Math.floor(Date.now() / 1000)) return null;
    return data.f;
  } catch {
    return null;
  }
}
