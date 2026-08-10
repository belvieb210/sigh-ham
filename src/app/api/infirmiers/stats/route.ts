import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  obtenirApercuDashboardInfirmiers,
  obtenirStatsInfirmiers,
} from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET(req: Request) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("apercu") === "1") {
      const apercu = await obtenirApercuDashboardInfirmiers();
      return NextResponse.json({ apercu });
    }
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
