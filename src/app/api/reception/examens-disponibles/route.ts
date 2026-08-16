import { NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { listerPatientsExamensDisponiblesReception } from "@/lib/laboratoire/lister-examens-disponibles";

/**
 * GET /api/reception/examens-disponibles
 * Patients avec au moins un examen Dr approuve (résultats validés par le biologiste).
 */
export async function GET() {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsExamensDisponiblesReception();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/reception/examens-disponibles]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les examens disponibles." },
      { status: 500 }
    );
  }
}
