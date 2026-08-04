import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { obtenirStatsPharmacie } from "@/lib/pharmacie/lister-patients-pharmacie";

export async function GET() {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const stats = await obtenirStatsPharmacie();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/pharmacie/stats]", e);
    return NextResponse.json({ erreur: "Impossible de charger les stats." }, { status: 500 });
  }
}
