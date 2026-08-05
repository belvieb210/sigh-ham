import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { rechercherDossiersMedecins } from "@/lib/medecins/listes-complementaires";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const dossiers = await rechercherDossiersMedecins(q);
    return NextResponse.json({ dossiers });
  } catch (e) {
    console.error("[GET /api/medecins/dossiers]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les dossiers." },
      { status: 500 }
    );
  }
}
