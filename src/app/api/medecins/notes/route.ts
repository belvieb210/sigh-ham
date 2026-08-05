import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerNotesMedicalesRecentes } from "@/lib/medecins/listes-complementaires";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  try {
    const notes = await listerNotesMedicalesRecentes();
    return NextResponse.json({ notes });
  } catch (e) {
    console.error("[GET /api/medecins/notes]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les notes." },
      { status: 500 }
    );
  }
}
