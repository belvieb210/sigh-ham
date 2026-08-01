import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { listerContactsMessagerie } from "@/lib/messagerie/creer-conversation";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const contacts = await listerContactsMessagerie(session.utilisateur.id, q);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("[GET /api/messagerie/contacts]", error);
    return NextResponse.json(
      { message: "Impossible de charger les contacts." },
      { status: 500 }
    );
  }
}
