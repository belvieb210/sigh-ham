import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { obtenirStatsMedecins } from "@/lib/medecins/lister-patients-medecins";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const stats = await obtenirStatsMedecins();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/medecins/stats]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
