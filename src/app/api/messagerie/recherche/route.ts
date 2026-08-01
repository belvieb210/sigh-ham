import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { rechercherMessagerie } from "@/lib/messagerie/actions-avancees";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const dateDebut = request.nextUrl.searchParams.get("dateDebut") ?? undefined;
  const dateFin = request.nextUrl.searchParams.get("dateFin") ?? undefined;

  const resultat = await rechercherMessagerie(session.utilisateur.id, q, {
    dateDebut,
    dateFin,
  });

  return NextResponse.json({
    messages: resultat.messages.map((m) => ({
      ...m,
      envoyeLe: m.envoyeLe.toISOString(),
    })),
  });
}
