import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { creerDiffusion } from "@/lib/messagerie/actions-avancees";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const body = (await request.json()) as { contenu: string; sujet?: string };
  if (!body.contenu?.trim()) {
    return NextResponse.json({ message: "Contenu requis." }, { status: 400 });
  }

  try {
    const conv = await creerDiffusion(session.utilisateur.id, body.contenu.trim(), body.sujet);
    return NextResponse.json({ id: conv.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NON_AUTORISE") {
      return NextResponse.json({ message: "Réservé à l'administration." }, { status: 403 });
    }
    return NextResponse.json({ message: "Erreur diffusion." }, { status: 500 });
  }
}
