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

/** Jeton opaque liant le QR à une facture précise (pas au patient entier). */
export function creerTokenRecuFacture(factureId: string): string {
  const exp = Math.floor(Date.now() / 1000) + DUREE_TOKEN_SECONDES;
  const payload = Buffer.from(
    JSON.stringify({ f: factureId, e: exp, v: 1 }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${signer(payload)}`;
}

/** Retourne l'id facture si le jeton est valide, sinon null. */
export function verifierTokenRecuFacture(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!signaturesEgales(sig, signer(payload))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { f?: string; e?: number };
    if (!data.f || typeof data.e !== "number") return null;
    if (data.e < Math.floor(Date.now() / 1000)) return null;
    return data.f;
  } catch {
    return null;
  }
}
