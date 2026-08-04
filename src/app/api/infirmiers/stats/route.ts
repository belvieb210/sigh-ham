import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { obtenirStatsInfirmiers } from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET() {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const stats = await obtenirStatsInfirmiers();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/infirmiers/stats]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
