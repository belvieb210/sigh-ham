import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerMedicamentsMedecins } from "@/lib/medecins/gestion-ordonnance";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const medicaments = await listerMedicamentsMedecins();
    return NextResponse.json({ medicaments });
  } catch (e) {
    console.error("[api/medecins/medicaments]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les médicaments." },
      { status: 500 }
    );
  }
}
