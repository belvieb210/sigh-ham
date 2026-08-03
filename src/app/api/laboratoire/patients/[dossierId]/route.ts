import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { obtenirDetailPatientLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await context.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const patient = await obtenirDetailPatientLaboratoire(dossierId.trim());
    if (!patient) {
      return NextResponse.json(
        { erreur: "Patient introuvable dans la file laboratoire." },
        { status: 404 }
      );
    }
    return NextResponse.json({ patient });
  } catch (e) {
    console.error("[api/laboratoire/patients/[dossierId]]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
