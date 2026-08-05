import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerPatientsTransferesCaisse } from "@/lib/medecins/listes-complementaires";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  try {
    const patients = await listerPatientsTransferesCaisse();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[GET /api/medecins/patients-transferes]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les patients transférés." },
      { status: 500 }
    );
  }
}
