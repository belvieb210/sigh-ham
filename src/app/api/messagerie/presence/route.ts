import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { mettreAJourPresence, listerPresences } from "@/lib/messagerie/presence";
import type { StatutPresence } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const ids = request.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    const presences = await listerPresences(ids);
    return NextResponse.json({
      presences: presences.map((p) => ({
        utilisateurId: p.utilisateurId,
        statut: p.statut,
        messageStatut: p.messageStatut,
        dernierPing: p.dernierPing.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/messagerie/presence]", error);
    return NextResponse.json({ presences: [] });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      statut: StatutPresence;
      messageStatut?: string;
    };

    const presence = await mettreAJourPresence(
      session.utilisateur.id,
      body.statut ?? "EN_LIGNE",
      body.messageStatut
    );

    return NextResponse.json({
      statut: presence.statut,
      messageStatut: presence.messageStatut,
    });
  } catch (error) {
    console.error("[PATCH /api/messagerie/presence]", error);
    return NextResponse.json({ statut: "HORS_LIGNE" });
  }
}
