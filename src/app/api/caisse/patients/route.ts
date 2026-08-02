import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { listerPatientsEnAttenteCaisse } from "@/lib/caisse/lister-patients-caisse";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsEnAttenteCaisse();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/caisse/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la file d'attente caisse." },
      { status: 500 }
    );
  }
}
