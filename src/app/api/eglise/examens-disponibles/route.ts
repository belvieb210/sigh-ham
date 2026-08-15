import { NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { listerPatientsExamensDisponiblesEglise } from "@/lib/laboratoire/lister-examens-disponibles";

/**
 * GET /api/eglise/examens-disponibles
 * Examens Dr approuve pour les patients du service Église uniquement.
 */
export async function GET() {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsExamensDisponiblesEglise();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/eglise/examens-disponibles]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les examens disponibles." },
      { status: 500 }
    );
  }
}
