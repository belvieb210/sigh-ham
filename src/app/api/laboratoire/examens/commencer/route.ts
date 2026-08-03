import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { commencerAnalysesDossier } from "@/lib/laboratoire/lister-patients-laboratoire";

export async function POST(request: Request) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as { dossierId?: string };
    if (!corps.dossierId?.trim()) {
      return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
    }

    const resultat = await commencerAnalysesDossier(
      corps.dossierId.trim(),
      session.utilisateur.id
    );
    return NextResponse.json({
      ...resultat,
      message: "Analyses démarrées.",
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Impossible de démarrer les analyses.";
    console.error("[api/laboratoire/examens/commencer]", e);
    return NextResponse.json({ erreur: message }, { status: 400 });
  }
}
