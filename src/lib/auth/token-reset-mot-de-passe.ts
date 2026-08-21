import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 60 * 60 * 1000; // 1 heure

function secretReset(): string {
  return (
    process.env.RESET_MDP_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.RECU_PUBLIC_SECRET ||
    process.env.DATABASE_URL ||
    "sigh-ham-reset-mdp-v1"
  );
}

function signer(payload: string): string {
  return createHmac("sha256", secretReset()).update(payload).digest("base64url");
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

/** Jeton court : `{userId}.{expMs}.{sig}` */
export function creerTokenResetMotDePasse(utilisateurId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${utilisateurId}.${exp}`;
  return `${payload}.${signer(payload)}`;
}

export function verifierTokenResetMotDePasse(
  token: string
): { utilisateurId: string } | null {
  const parties = token.split(".");
  if (parties.length !== 3) return null;
  const [utilisateurId, expStr, sig] = parties;
  if (!utilisateurId || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const payload = `${utilisateurId}.${expStr}`;
  if (!signaturesEgales(sig, signer(payload))) return null;
  return { utilisateurId };
}
