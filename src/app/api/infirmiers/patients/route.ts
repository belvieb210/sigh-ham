import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { listerPatientsInfirmiers } from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET() {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const patients = await listerPatientsInfirmiers();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/infirmiers/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la file." },
      { status: 500 }
    );
  }
}
