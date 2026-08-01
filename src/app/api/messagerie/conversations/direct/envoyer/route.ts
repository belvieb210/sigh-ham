import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { envoyerMessageConversationDirecte } from "@/lib/messagerie/creer-conversation";
import { obtenirConversationDirecte } from "@/lib/messagerie/lister-conversations";
import type { PayloadEnvoiMessage } from "@/lib/messagerie/types";
import type { PrioriteMessage, TypeMessage } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const participantId = (form.get("participantId") as string)?.trim();
    const conversationId = (form.get("conversationId") as string)?.trim() || undefined;
    const contenu = (form.get("contenu") as string) ?? "";
    const priorite = (form.get("priorite") as PrioriteMessage) || undefined;
    const fichiers: PayloadEnvoiMessage["fichiers"] = [];

    for (const entry of form.getAll("fichiers")) {
      if (entry instanceof File && entry.size > 0) {
        const buffer = Buffer.from(await entry.arrayBuffer());
        fichiers.push({
          buffer,
          nom: entry.name,
          mimeType: entry.type || "application/octet-stream",
        });
      }
    }

    if (!participantId) {
      return NextResponse.json({ message: "Destinataire requis." }, { status: 400 });
    }

    const payload: PayloadEnvoiMessage = {
      contenu,
      priorite,
      type: fichiers.length ? ("FICHIER" as TypeMessage) : undefined,
      fichiers,
    };

    const { conversationId: convId, message } = await envoyerMessageConversationDirecte(
      session.utilisateur.id,
      participantId,
      payload,
      conversationId
    );

    const conversation = await obtenirConversationDirecte(session.utilisateur.id, participantId);

    return NextResponse.json(
      {
        conversationId: convId,
        conversation: conversation ?? null,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "CONTENU_VIDE") {
      return NextResponse.json({ message: "Le message ne peut pas être vide." }, { status: 400 });
    }
    if (msg === "PARTICIPANT_REQUIS") {
      return NextResponse.json({ message: "Destinataire invalide." }, { status: 400 });
    }
    if (msg === "CONVERSATION_INACCESSIBLE") {
      return NextResponse.json({ message: "Conversation inaccessible." }, { status: 403 });
    }
    console.error("[POST /api/messagerie/conversations/direct/envoyer]", error);
    return NextResponse.json(
      { message: "Impossible d'envoyer le message." },
      { status: 500 }
    );
  }
}
