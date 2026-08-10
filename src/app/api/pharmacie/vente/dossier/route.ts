import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { obtenirDossierVentePharmacie } from "@/lib/pharmacie/obtenir-dossier-vente-pharmacie";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
  if (!dossierId) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }
  try {
    const dossier = await obtenirDossierVentePharmacie(dossierId);
    if (!dossier) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({ dossier });
  } catch (e) {
    console.error("[api/pharmacie/vente/dossier]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
