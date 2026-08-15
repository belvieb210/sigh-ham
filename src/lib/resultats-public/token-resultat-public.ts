import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const DUREE_TOKEN_SEC = 30 * 60;

function secretResultats(): string {
  return (
    process.env.RESULTATS_PUBLIC_SECRET ||
    process.env.RECU_PUBLIC_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "sigh-ham-resultats-public-v1"
  );
}

function signer(payload: string): string {
  return createHmac("sha256", secretResultats()).update(payload).digest("base64url");
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

export type PayloadTokenResultatPublic = {
  factureId: string;
  dossierId: string;
  examIds: string[];
};

export function creerTokenResultatPublic(
  payload: PayloadTokenResultatPublic
): string {
  const exp = Math.floor(Date.now() / 1000) + DUREE_TOKEN_SEC;
  const body = JSON.stringify({
    f: payload.factureId,
    d: payload.dossierId,
    x: payload.examIds.join(","),
    e: exp,
  });
  const payloadB64 = Buffer.from(body).toString("base64url");
  return `${payloadB64}.${signer(payloadB64)}`;
}

export function verifierTokenResultatPublic(
  token: string
): PayloadTokenResultatPublic | null {
  let brut = token.trim();
  try {
    brut = decodeURIComponent(brut);
  } catch {
    /* garde brut */
  }

  const i = brut.lastIndexOf(".");
  if (i <= 0) return null;

  const payloadB64 = brut.slice(0, i);
  const sig = brut.slice(i + 1);
  if (!payloadB64 || !sig) return null;
  if (!signaturesEgales(sig, signer(payloadB64))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { f?: string; d?: string; x?: string; e?: number };

    if (!data.f || !data.d || !data.x || typeof data.e !== "number") return null;
    if (data.e < Math.floor(Date.now() / 1000)) return null;

    const examIds = data.x
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (examIds.length === 0) return null;

    return { factureId: data.f, dossierId: data.d, examIds };
  } catch {
    return null;
  }
}
