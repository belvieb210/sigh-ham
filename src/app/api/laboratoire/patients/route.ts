import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { listerPatientsLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";

export async function GET() {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsLaboratoire();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/laboratoire/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la file laboratoire." },
      { status: 500 }
    );
  }
}
