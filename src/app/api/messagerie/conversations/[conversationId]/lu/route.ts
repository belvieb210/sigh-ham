import { NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { marquerConversationLue } from "@/lib/messagerie/marquer-lu";

type Params = { params: Promise<{ conversationId: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    const resultat = await marquerConversationLue(conversationId, session.utilisateur.id);
    return NextResponse.json(resultat);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "CONVERSATION_INACCESSIBLE") {
      return NextResponse.json({ message: "Conversation inaccessible." }, { status: 403 });
    }
    console.error("[PATCH /api/messagerie/conversations/[id]/lu]", error);
    return NextResponse.json(
      { message: "Impossible de marquer comme lu." },
      { status: 500 }
    );
  }
}
