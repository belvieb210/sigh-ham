import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { chargerSaisieResultats } from "@/lib/laboratoire/saisie-resultats";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await context.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const saisie = await chargerSaisieResultats(dossierId.trim());
    if (!saisie) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({ saisie });
  } catch (e) {
    console.error("[api/laboratoire/dossiers/.../saisie-resultats]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
