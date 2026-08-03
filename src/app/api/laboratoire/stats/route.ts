import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { obtenirStatsLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";

export async function GET() {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const stats = await obtenirStatsLaboratoire();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/laboratoire/stats]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
