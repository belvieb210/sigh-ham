import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { obtenirDetailPatientMedecins } from "@/lib/medecins/lister-patients-medecins";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await context.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const patient = await obtenirDetailPatientMedecins(dossierId.trim());
    if (!patient) {
      return NextResponse.json(
        { erreur: "Patient introuvable dans la file médecins." },
        { status: 404 }
      );
    }
    return NextResponse.json({ patient });
  } catch (e) {
    console.error("[api/medecins/patients/[dossierId]]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
