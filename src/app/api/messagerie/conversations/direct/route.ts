import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { obtenirConversationDirecte } from "@/lib/messagerie/lister-conversations";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const participantId = request.nextUrl.searchParams.get("participantId")?.trim();
  if (!participantId) {
    return NextResponse.json({ message: "Participant requis." }, { status: 400 });
  }

  try {
    const conversation = await obtenirConversationDirecte(
      session.utilisateur.id,
      participantId
    );
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[GET /api/messagerie/conversations/direct]", error);
    return NextResponse.json(
      { message: "Impossible de charger la conversation." },
      { status: 500 }
    );
  }
}
