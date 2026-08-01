import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  enregistrerAbonnementPush,
  supprimerAbonnementPush,
} from "@/lib/notifications/push-navigateur";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ message: "Abonnement invalide." }, { status: 400 });
    }

    await enregistrerAbonnementPush(
      session.utilisateur.id,
      body,
      request.headers.get("user-agent") ?? undefined
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/notifications/push/subscribe]", error);
    return NextResponse.json({ message: "Abonnement impossible." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const body = (await request.json()) as { endpoint?: string };
    if (body.endpoint) {
      await supprimerAbonnementPush(session.utilisateur.id, body.endpoint);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
