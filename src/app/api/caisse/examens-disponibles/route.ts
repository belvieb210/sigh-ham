import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { patientCorrespondPageStatut, trierPatientsParArriveeDesc } from "@/features/laboratoire/utils-affichage";
import { listerPatientsLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";

/**
 * GET /api/caisse/examens-disponibles
 * Patients avec au moins un examen Dr approuve (résultats validés par le biologiste).
 */
export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const tous = await listerPatientsLaboratoire();
    const patients = trierPatientsParArriveeDesc(
      tous.filter((p) => patientCorrespondPageStatut(p, "DR_APPROUVE"))
    );
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/caisse/examens-disponibles]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les examens disponibles." },
      { status: 500 }
    );
  }
}
