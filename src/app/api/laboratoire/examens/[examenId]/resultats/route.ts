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
        valeurSecondaire?: string | null;
        nonRequis?: boolean;
        commentaire?: string | null;
      }[];
      remarque?: string | null;
      piecesJointes?: {
        nom: string;
        url: string;
        mimeType: string;
        taille?: number;
      }[];
      action?: "brouillon" | "verifier" | "rejeter" | "approuver" | "restaurer" | "supprimer";
      verifier?: boolean;
    };

    const action =
      corps.action ?? (corps.verifier === true ? "verifier" : "brouillon");

    const actionsSansLignes = action === "restaurer" || action === "supprimer";
    if (!actionsSansLignes && !Array.isArray(corps.lignes)) {
      return NextResponse.json({ erreur: "lignes requises." }, { status: 400 });
    }

    await enregistrerResultatsExamen(examenId.trim(), session.utilisateur.id, {
      lignes: corps.lignes ?? [],
      remarque: corps.remarque,
      piecesJointes: corps.piecesJointes,
      action,
    });

    const messages: Record<string, string> = {
      brouillon: "Résultats enregistrés.",
      verifier: "Résultats vérifiés et enregistrés.",
      rejeter: "Examen rejeté.",
      approuver: "Examen approuvé par le biologiste.",
      restaurer: "Examen restauré dans la file de vérification.",
      supprimer: "Examen supprimé.",
    };

    return NextResponse.json({
      message: messages[action] ?? "Résultats enregistrés.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur.";
    console.error("[api/laboratoire/examens/.../resultats]", e);
    return NextResponse.json({ erreur: message }, { status: 400 });
  }
}
