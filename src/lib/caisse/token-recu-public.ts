import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

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

function sigPrefixeValide(sig: string, signatureComplete: string): boolean {
  if (sig.length < 8 || sig.length > signatureComplete.length) return false;
  return signaturesEgales(sig, signatureComplete.slice(0, sig.length));
}

/**
 * Jeton court pour QR « aéré » : `{factureId}~{sig8}`.
 * Lié à une facture précise uniquement.
 */
export function creerTokenRecuFacture(factureId: string): string {
  return `${factureId}~${signer(factureId).slice(0, 8)}`;
}

/** Chemin URL sans encodage inutile (QR plus clair). */
export function cheminRecuPublic(token: string): string {
  if (/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+)?$/.test(token)) {
    return `/r/${token}`;
  }
  return `/r/${encodeURIComponent(token)}`;
}

function decouperToken(token: string): { payload: string; sig: string } | null {
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
  let brut = token.trim();
  try {
    brut = decodeURIComponent(brut);
  } catch {
    /* garde brut */
  }

  const parts = decouperToken(brut);
  if (!parts) return null;

  const signatureComplete = signer(parts.payload);

  // v3 : factureId~sig8 (payload = id Prisma)
  if (/^[a-z][a-z0-9]{10,}$/i.test(parts.payload)) {
    if (
      sigPrefixeValide(parts.sig, signatureComplete) ||
      signaturesEgales(parts.sig, signatureComplete)
    ) {
      return parts.payload;
    }
  }

  // v1 / v2 : payload JSON base64url + signature complète
  if (!signaturesEgales(parts.sig, signatureComplete)) return null;

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
