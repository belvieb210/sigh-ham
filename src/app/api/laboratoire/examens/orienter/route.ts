import { NextResponse } from "next/server";
import { CHEMINS_STATUT_ANALYSE_LABO } from "@/constants/laboratoire-orientations";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { orienterStatutAnalyseDossier } from "@/lib/laboratoire/orienter-statut-analyse";

export async function POST(request: Request) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      orientation?: string;
    };

    if (!corps.dossierId?.trim() || !corps.orientation?.trim()) {
      return NextResponse.json(
        { message: "dossierId et orientation requis." },
        { status: 400 }
      );
    }

    const resultat = await orienterStatutAnalyseDossier(
      corps.dossierId.trim(),
      corps.orientation.trim(),
      session.utilisateur.id
    );

    const chemin =
      CHEMINS_STATUT_ANALYSE_LABO[
        resultat.orientation as keyof typeof CHEMINS_STATUT_ANALYSE_LABO
      ];

    return NextResponse.json({
      message: `Patient orienté vers « ${resultat.orientation} ».`,
      chemin,
      ...resultat,
    });
  } catch (e) {
    console.error("[POST /api/laboratoire/examens/orienter]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'orienter le statut.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
