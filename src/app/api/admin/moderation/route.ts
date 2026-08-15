import { NextRequest, NextResponse } from "next/server";
import type { TypeConversation } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  listerConversationsModeration,
  listerFichiersModeration,
  listerMessagesModeration,
  obtenirStatsModeration,
} from "@/lib/admin/moderation-messagerie";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const sp = request.nextUrl.searchParams;
    const vue = sp.get("vue") ?? "stats";

    if (vue === "stats") {
      const stats = await obtenirStatsModeration();
      return NextResponse.json({ stats });
    }

    if (vue === "conversations") {
      const conversations = await listerConversationsModeration({
        q: sp.get("q") ?? undefined,
        bloquees: sp.get("bloquees") === "true",
        supprimees: sp.get("supprimees") === "true",
        type: (sp.get("type") as TypeConversation | null) ?? undefined,
      });
      return NextResponse.json({ conversations });
    }

    if (vue === "messages") {
      const messages = await listerMessagesModeration({
        supprimes: sp.get("supprimes") === "true",
        signales: sp.get("signales") === "true",
        bloques: sp.get("bloques") === "true",
      });
      return NextResponse.json({ messages });
    }

    if (vue === "fichiers") {
      const fichiers = await listerFichiersModeration({
        signales: sp.get("signales") === "true",
        supprimes: sp.get("supprimes") === "true",
      });
      return NextResponse.json({ fichiers });
    }

    if (vue === "groupes") {
      const groupes = await listerConversationsModeration({
        type: "GROUPE",
        supprimees: sp.get("supprimes") === "true",
      });
      return NextResponse.json({ groupes });
    }

    return NextResponse.json({ message: "Vue inconnue." }, { status: 400 });
  } catch (error) {
    console.error("[GET /api/admin/moderation]", error);
    return NextResponse.json(
      { message: "Impossible de charger la modération." },
      { status: 500 }
    );
  }
}
