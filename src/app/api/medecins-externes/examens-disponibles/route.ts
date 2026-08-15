import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { listerPatientsExamensDisponiblesMedecinExterne } from "@/lib/laboratoire/lister-examens-disponibles";

/**
 * GET /api/medecins-externes/examens-disponibles
 * Examens Dr approuve pour les patients enregistrés par le médecin connecté.
 */
export async function GET() {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const patients =
      await listerPatientsExamensDisponiblesMedecinExterne(medecinExterneId);
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/medecins-externes/examens-disponibles]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les examens disponibles." },
      { status: 500 }
    );
  }
}
