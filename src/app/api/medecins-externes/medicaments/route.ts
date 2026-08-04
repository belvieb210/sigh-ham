import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { listerMedicamentsMedecins } from "@/lib/medecins/gestion-ordonnance";

export async function GET() {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    return NextResponse.json({
      medicaments: await listerMedicamentsMedecins(),
    });
  } catch (e) {
    console.error("[api/medecins-externes/medicaments]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
