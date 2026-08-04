import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { listerPatientsMedecinsExternes } from "@/lib/medecins-externes/lister-patients";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";

export async function GET() {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const patients = await listerPatientsMedecinsExternes(medecinExterneId);
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/medecins-externes/patients]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
