import { createHash, randomBytes } from "crypto";

/** Utilisable hors Next.js (socket-server, scripts). */
export function genererTokenSession(): string {
  return randomBytes(32).toString("hex");
}

export function hasherToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
