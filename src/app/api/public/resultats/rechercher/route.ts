import { NextRequest, NextResponse } from "next/server";
import { rechercherResultatsPatientPublic } from "@/lib/resultats-public/rechercher-resultats-patient";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nom?: string;
      prenom?: string;
      numeroPatient?: string;
      numeroFacture?: string;
    };

    const resultat = await rechercherResultatsPatientPublic({
      nom: body.nom?.trim() ?? "",
      prenom: body.prenom?.trim() ?? "",
      numeroPatient: body.numeroPatient?.trim() ?? "",
      numeroFacture: body.numeroFacture?.trim() ?? "",
    });

    if (!resultat) {
      return NextResponse.json(
        {
          erreur:
            "Informations incorrectes ou résultats non encore disponibles. Vérifiez vos données ou contactez l'accueil.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ resultat });
  } catch (e) {
    console.error("[POST /api/public/resultats/rechercher]", e);
    return NextResponse.json(
      { erreur: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
