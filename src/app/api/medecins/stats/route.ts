import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  obtenirApercuDashboardMedecins,
  obtenirStatsMedecins,
} from "@/lib/medecins/lister-patients-medecins";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    if (request.nextUrl.searchParams.get("apercu") === "1") {
      const apercu = await obtenirApercuDashboardMedecins();
      return NextResponse.json({ stats: apercu.stats, apercu });
    }
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
