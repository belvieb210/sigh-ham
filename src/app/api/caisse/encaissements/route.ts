import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { listerEncaissementsDuJour } from "@/lib/caisse/facturation";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const encaissements = await listerEncaissementsDuJour();
    return NextResponse.json({ encaissements });
  } catch (e) {
    console.error("[api/caisse/encaissements]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les encaissements du jour." },
      { status: 500 }
    );
  }
}
