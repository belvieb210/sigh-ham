import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerPatientsDuJourMedecins } from "@/lib/medecins/listes-complementaires";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  try {
    const patients = await listerPatientsDuJourMedecins();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[GET /api/medecins/patients-du-jour]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les patients du jour." },
      { status: 500 }
    );
  }
}
