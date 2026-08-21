import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoireOuCaisse } from "@/lib/auth/garde-api-laboratoire-ou-caisse";
import { construireEtiquetteResultatsDossier } from "@/lib/laboratoire/etiquette-resultats";

export async function GET(
  request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiLaboratoireOuCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await context.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const examenIds = searchParams.getAll("examenId").filter(Boolean);

  try {
    const etiquette = await construireEtiquetteResultatsDossier(
      dossierId.trim(),
      examenIds.length > 0 ? examenIds : undefined
    );
    if (!etiquette) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({ etiquette });
  } catch (e) {
    console.error("[api/.../etiquette-resultats]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
