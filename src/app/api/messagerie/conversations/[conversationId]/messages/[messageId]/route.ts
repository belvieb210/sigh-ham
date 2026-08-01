import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  ajouterReaction,
  basculerEpingleMessage,
  masquerMessagePourMoi,
  modifierMessageContenu,
  retirerReaction,
  supprimerMessage,
  transfererMessage,
} from "@/lib/messagerie/actions-avancees";

type Params = { params: Promise<{ conversationId: string; messageId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { messageId } = await params;
  try {
    let portee: "moi" | "tous" = "tous";
    try {
      const body = (await request.json()) as { portee?: "moi" | "tous" };
      if (body.portee === "moi") portee = "moi";
    } catch {
      /* corps vide = supprimer pour tous (legacy) */
    }

    if (portee === "moi") {
      await masquerMessagePourMoi(messageId, session.utilisateur.id);
    } else {
      await supprimerMessage(messageId, session.utilisateur.id);
    }
    return NextResponse.json({ ok: true, portee });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "NON_AUTORISE") {
      return NextResponse.json({ message: "Action non autorisée." }, { status: 403 });
    }
    return NextResponse.json({ message: "Suppression impossible." }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { messageId } = await params;
  const body = (await request.json()) as {
    action: "modifier" | "transferer";
    contenu?: string;
    conversationCibleId?: string;
  };

  try {
    if (body.action === "modifier") {
      if (!body.contenu?.trim()) {
        return NextResponse.json({ message: "Contenu requis." }, { status: 400 });
      }
      await modifierMessageContenu(messageId, session.utilisateur.id, body.contenu);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "transferer") {
      if (!body.conversationCibleId) {
        return NextResponse.json({ message: "Conversation cible requise." }, { status: 400 });
      }
      const message = await transfererMessage(
        messageId,
        session.utilisateur.id,
        body.conversationCibleId
      );
      return NextResponse.json({ ok: true, message });
    }

    return NextResponse.json({ message: "Action inconnue." }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "DELAI_MODIFICATION_DEPASSE") {
      return NextResponse.json(
        { message: "Délai de modification dépassé (15 min)." },
        { status: 403 }
      );
    }
    if (msg === "NON_AUTORISE" || msg === "CONVERSATION_INACCESSIBLE") {
      return NextResponse.json({ message: "Action non autorisée." }, { status: 403 });
    }
    console.error("[PATCH message]", error);
    return NextResponse.json({ message: "Action impossible." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { messageId } = await params;
  const body = (await request.json()) as {
    action: "reaction" | "epingle";
    emoji?: "POUCES" | "COEUR" | "CHECK" | "EPINGLE" | "RIRE" | "SURPRISE";
    retirer?: boolean;
  };

  try {
    if (body.action === "epingle") {
      const result = await basculerEpingleMessage(messageId, session.utilisateur.id);
      return NextResponse.json(result);
    }

    if (!body.emoji) {
      return NextResponse.json({ message: "Emoji requis." }, { status: 400 });
    }

    if (body.retirer) {
      await retirerReaction(messageId, session.utilisateur.id, body.emoji);
    } else {
      await ajouterReaction(messageId, session.utilisateur.id, body.emoji);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Action impossible." }, { status: 403 });
  }
}
