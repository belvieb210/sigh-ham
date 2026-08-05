import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { obtenirStatsSupervision } from "@/lib/admin/stats-supervision";

export async function GET(_request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const stats = await obtenirStatsSupervision();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { message: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
