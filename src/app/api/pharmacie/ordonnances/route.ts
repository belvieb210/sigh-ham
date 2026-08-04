import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import {
  listerOrdonnancesInbox,
  preparerVenteDepuisOrdonnance,
} from "@/lib/pharmacie/gestion-ordonnances";

export async function GET() {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const ordonnances = await listerOrdonnancesInbox();
    return NextResponse.json({ ordonnances });
  } catch (e) {
    console.error("[api/pharmacie/ordonnances]", e);
    return NextResponse.json({ erreur: "Erreur chargement." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as { ordonnanceId?: string };
    if (!corps.ordonnanceId) {
      return NextResponse.json({ message: "ordonnanceId requis." }, { status: 400 });
    }
    const vente = await preparerVenteDepuisOrdonnance(
      session.utilisateur.id,
      corps.ordonnanceId
    );
    return NextResponse.json({
      message: "Vente préparée. Transmettez-la à la caisse.",
      vente,
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
