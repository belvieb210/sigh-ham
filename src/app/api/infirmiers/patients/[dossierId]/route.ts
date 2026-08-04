import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { obtenirDetailPatientInfirmiers } from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { dossierId } = await context.params;
    const patient = await obtenirDetailPatientInfirmiers(dossierId);
    if (!patient) {
      return NextResponse.json({ erreur: "Patient introuvable." }, { status: 404 });
    }
    return NextResponse.json({ patient });
  } catch (e) {
    console.error("[api/infirmiers/patients/[dossierId]]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le dossier." },
      { status: 500 }
    );
  }
}
