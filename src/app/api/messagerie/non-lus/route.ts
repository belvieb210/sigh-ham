import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { compterMessagesNonLus } from "@/lib/messagerie/marquer-lu";

export async function GET() {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const total = await compterMessagesNonLus(session.utilisateur.id);
    return NextResponse.json({ total });
  } catch (error) {
    console.error("[GET /api/messagerie/non-lus]", error);
    return NextResponse.json(
      { message: "Impossible de compter les messages non lus." },
      { status: 500 }
    );
  }
}
