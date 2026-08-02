import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { obtenirDossierFacturation } from "@/lib/caisse/facturation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await params;

  try {
    const dossier = await obtenirDossierFacturation(dossierId);
    if (!dossier) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({ dossier });
  } catch (e) {
    console.error("[api/caisse/patients/[dossierId]]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le dossier de facturation." },
      { status: 500 }
    );
  }
}
