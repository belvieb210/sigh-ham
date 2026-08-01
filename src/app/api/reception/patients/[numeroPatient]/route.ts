import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { obtenirPatientPourFormulaire } from "@/lib/reception/obtenir-patient-formulaire";

interface ParamsRoute {
  params: Promise<{ numeroPatient: string }>;
}

export async function GET(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    const patient = await obtenirPatientPourFormulaire(decode);

    if (!patient) {
      return NextResponse.json({ message: "Patient introuvable." }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("[GET /api/reception/patients/[numeroPatient]]", error);
    return NextResponse.json(
      { message: "Impossible de charger le patient." },
      { status: 500 }
    );
  }
}
