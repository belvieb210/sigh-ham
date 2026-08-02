import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { obtenirStatsCaisseJour } from "@/lib/caisse/lister-patients-caisse";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const stats = await obtenirStatsCaisseJour();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/caisse/stats]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les statistiques caisse." },
      { status: 500 }
    );
  }
}
