import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { obtenirMessagesConversation } from "@/lib/messagerie/obtenir-messages";
import { envoyerMessage } from "@/lib/messagerie/envoyer-message";
import type { PayloadEnvoiMessage } from "@/lib/messagerie/types";
import type { PrioriteMessage, TypeMessage } from "@/generated/prisma/enums";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    const avant = request.nextUrl.searchParams.get("avant") ?? undefined;
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;

    const resultat = await obtenirMessagesConversation(
      conversationId,
      session.utilisateur.id,
      { avant, limite }
    );

    return NextResponse.json(resultat);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "CONVERSATION_INACCESSIBLE") {
      return NextResponse.json({ message: "Conversation inaccessible." }, { status: 403 });
    }
    console.error("[GET /api/messagerie/conversations/[id]/messages]", error);
    return NextResponse.json(
      { message: "Impossible de charger les messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const { conversationId } = await params;
  const typeContenu = request.headers.get("content-type") ?? "";

  try {
    let payload: PayloadEnvoiMessage;

    if (typeContenu.includes("multipart/form-data")) {
      const form = await request.formData();
      const contenu = (form.get("contenu") as string) ?? "";
      const priorite = (form.get("priorite") as PrioriteMessage) || undefined;
      const messageParentId = (form.get("messageParentId") as string) || undefined;
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

      payload = {
        contenu,
        priorite,
        messageParentId,
        type: fichiers.length ? ("FICHIER" as TypeMessage) : undefined,
        fichiers,
      };
    } else {
      const body = (await request.json()) as PayloadEnvoiMessage;
      payload = {
        contenu: body.contenu,
        priorite: body.priorite as PrioriteMessage | undefined,
        type: body.type,
        metadonnees: body.metadonnees,
        messageParentId: body.messageParentId,
      };
    }

    const message = await envoyerMessage(conversationId, session.utilisateur.id, payload);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "CONTENU_VIDE") {
      return NextResponse.json({ message: "Le message ne peut pas être vide." }, { status: 400 });
    }
    if (msg === "CONVERSATION_INACCESSIBLE") {
      return NextResponse.json({ message: "Conversation inaccessible." }, { status: 403 });
    }
    console.error("[POST /api/messagerie/conversations/[id]/messages]", error);
    return NextResponse.json(
      { message: "Impossible d'envoyer le message." },
      { status: 500 }
    );
  }
}
