import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { enregistrerResultatsExamen } from "@/lib/laboratoire/saisie-resultats";

export async function POST(
  request: Request,
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
    const corps = (await request.json()) as {
      lignes?: {
        parametreTypeExamenId: string;
        valeur: string;
        nonRequis?: boolean;
      }[];
      remarque?: string | null;
      verifier?: boolean;
    };

    if (!Array.isArray(corps.lignes)) {
      return NextResponse.json({ erreur: "lignes requises." }, { status: 400 });
    }

    await enregistrerResultatsExamen(examenId.trim(), session.utilisateur.id, {
      lignes: corps.lignes,
      remarque: corps.remarque,
      verifier: corps.verifier === true,
    });

    return NextResponse.json({
      message: corps.verifier
        ? "Résultats vérifiés et enregistrés."
        : "Résultats enregistrés.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur.";
    console.error("[api/laboratoire/examens/.../resultats]", e);
    return NextResponse.json({ erreur: message }, { status: 400 });
  }
}
