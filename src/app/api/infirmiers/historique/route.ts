import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { listerHistoriqueConstantes } from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET() {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const historique = await listerHistoriqueConstantes(50);
    return NextResponse.json({ historique });
  } catch (e) {
    console.error("[api/infirmiers/historique]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger l'historique." },
      { status: 500 }
    );
  }
}
