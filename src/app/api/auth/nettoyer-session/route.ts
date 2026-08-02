import { NextRequest, NextResponse } from "next/server";
import { detruireSessionCourante, supprimerCookieSession } from "@/lib/auth/session";

/** Efface le cookie/session invalide (ex. après import DB). */
export async function POST() {
  try {
    await detruireSessionCourante();
  } catch {
    await supprimerCookieSession().catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  try {
    await detruireSessionCourante();
  } catch {
    await supprimerCookieSession().catch(() => undefined);
  }
  const redirectParam = request.nextUrl.searchParams.get("redirect");
  const cible = new URL("/connexion", request.url);
  if (redirectParam) {
    cible.searchParams.set("redirect", redirectParam);
  }
  return NextResponse.redirect(cible);
}
