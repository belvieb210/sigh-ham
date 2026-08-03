import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { listerPatientsTransfertsCaisse } from "@/lib/caisse/lister-transferts-caisse";
import { reorienterPatientDepuisCaisse } from "@/lib/caisse/reorienter-patient-caisse";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const data = await listerPatientsTransfertsCaisse();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[GET /api/caisse/transferts]", e);
    return NextResponse.json(
      { message: "Impossible de charger les patients caisse." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      orientation?: string;
    };

    if (!corps.dossierId?.trim() || !corps.orientation?.trim()) {
      return NextResponse.json(
        { message: "dossierId et orientation requis." },
        { status: 400 }
      );
    }

    const resultat = await reorienterPatientDepuisCaisse(
      session.utilisateur.id,
      corps.dossierId.trim(),
      corps.orientation.trim()
    );

    return NextResponse.json({
      message: `Patient orienté vers ${resultat.salleDestination}.`,
      ...resultat,
    });
  } catch (e) {
    console.error("[POST /api/caisse/transferts]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'orienter le patient.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
