import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DUREE_SESSION_JOURS, NOM_COOKIE_SESSION } from "@/lib/auth/constants";
import { genererTokenSession, hasherToken } from "@/lib/auth/hash-token";

export { NOM_COOKIE_SESSION } from "@/lib/auth/constants";
export { genererTokenSession, hasherToken } from "@/lib/auth/hash-token";

const DUREE_SESSION = DUREE_SESSION_JOURS;

export async function creerSession(
  utilisateurId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const token = genererTokenSession();
  const tokenHash = hasherToken(token);
  const expireLe = new Date();
  expireLe.setDate(expireLe.getDate() + DUREE_SESSION);

  await prisma.session.create({
    data: {
      utilisateurId,
      tokenHash,
      expireLe,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    },
  });

  return token;
}

export async function lireSessionDepuisCookie() {
  const jar = await cookies();
  const token = jar.get(NOM_COOKIE_SESSION)?.value;
  if (!token) return null;

  const tokenHash = hasherToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      utilisateur: {
        include: {
          role: {
            include: { salle: true },
          },
        },
      },
    },
  });

  if (!session || session.expireLe < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  if (session.utilisateur.statut !== "ACTIF") {
    return null;
  }

  return session;
}

export async function definirCookieSession(token: string) {
  const jar = await cookies();
  jar.set(NOM_COOKIE_SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SESSION * 24 * 60 * 60,
  });
}

export async function supprimerCookieSession() {
  const jar = await cookies();
  jar.delete(NOM_COOKIE_SESSION);
}

export async function detruireSessionCourante() {
  const jar = await cookies();
  const token = jar.get(NOM_COOKIE_SESSION)?.value;
  if (token) {
    const tokenHash = hasherToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  await supprimerCookieSession();
}
