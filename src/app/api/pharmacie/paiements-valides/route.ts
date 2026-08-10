import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { listerPaiementsValidesPharmacie } from "@/lib/pharmacie/lister-paiements-valides-pharmacie";

export async function GET() {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const paiements = await listerPaiementsValidesPharmacie();
    return NextResponse.json({ paiements });
  } catch (e) {
    console.error("[api/pharmacie/paiements-valides]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
