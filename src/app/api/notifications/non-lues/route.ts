import { NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { compterNotificationsNonLues } from "@/lib/notifications/service-notifications";

export async function GET() {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const total = await compterNotificationsNonLues(session.utilisateur.id);
    return NextResponse.json({ total });
  } catch (error) {
    console.error("[GET /api/notifications/non-lues]", error);
    return NextResponse.json({ total: 0 });
  }
}
