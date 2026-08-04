import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerPatientsMedecins } from "@/lib/medecins/lister-patients-medecins";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsMedecins();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/medecins/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les patients médecins." },
      { status: 500 }
    );
  }
}
