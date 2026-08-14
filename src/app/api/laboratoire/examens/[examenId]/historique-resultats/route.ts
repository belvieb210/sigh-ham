import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { chargerHistoriqueResultatsExamen } from "@/lib/laboratoire/historique-resultats-examen";

export async function GET(
  _request: Request,
  context: { params: Promise<{ examenId: string }> }
) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { examenId } = await context.params;
  if (!examenId?.trim()) {
    return NextResponse.json({ erreur: "examenId requis." }, { status: 400 });
  }

  try {
    const historique = await chargerHistoriqueResultatsExamen(examenId.trim());
    if (!historique) {
      return NextResponse.json({ erreur: "Examen introuvable." }, { status: 404 });
    }
    return NextResponse.json({ historique });
  } catch {
    return NextResponse.json(
      { erreur: "Impossible de charger l'historique." },
      { status: 500 }
    );
  }
}
