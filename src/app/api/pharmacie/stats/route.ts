import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { obtenirApercuDashboardPharmacie } from "@/lib/pharmacie/apercu-dashboard-pharmacie";
import { obtenirStatsPharmacie } from "@/lib/pharmacie/lister-patients-pharmacie";

export async function GET(req: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("apercu") === "1") {
      const apercu = await obtenirApercuDashboardPharmacie();
      return NextResponse.json({ apercu });
    }
    const stats = await obtenirStatsPharmacie();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/pharmacie/stats]", e);
    return NextResponse.json({ erreur: "Impossible de charger les stats." }, { status: 500 });
  }
}
