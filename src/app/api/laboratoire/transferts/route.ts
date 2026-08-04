import { NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { reorienterPatientDepuisLaboratoire } from "@/lib/laboratoire/reorienter-patient-laboratoire";

export async function POST(request: Request) {
  const session = await obtenirSessionApiLaboratoire();
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

    const resultat = await reorienterPatientDepuisLaboratoire(
      session.utilisateur.id,
      corps.dossierId.trim(),
      corps.orientation.trim()
    );

    return NextResponse.json({
      message: resultat.transfertMisAJour
        ? `Destination mise à jour : ${resultat.salleDestination}. Confirmez via le menu ⋮.`
        : `Transfert créé vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
      ...resultat,
    });
  } catch (e) {
    console.error("[POST /api/laboratoire/transferts]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'orienter le patient.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
