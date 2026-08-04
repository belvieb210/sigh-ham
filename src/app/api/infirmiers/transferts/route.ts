import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { reorienterPatientDepuisInfirmiers } from "@/lib/infirmiers/reorienter-patient-infirmiers";

export async function POST(request: Request) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      orientation?: string;
      orientations?: string[];
    };

    const orientations =
      corps.orientations?.filter(Boolean) ??
      (corps.orientation?.trim() ? [corps.orientation.trim()] : []);

    if (!corps.dossierId?.trim() || orientations.length === 0) {
      return NextResponse.json(
        { message: "dossierId et orientation(s) requis." },
        { status: 400 }
      );
    }

    const resultat = await reorienterPatientDepuisInfirmiers(
      session.utilisateur.id,
      corps.dossierId.trim(),
      orientations
    );

    return NextResponse.json({
      message: resultat.transfertMisAJour
        ? `Destination(s) à jour : ${resultat.salleDestination}. Confirmez via le menu ⋮.`
        : `Transfert(s) créé(s) vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
      ...resultat,
    });
  } catch (e) {
    console.error("[POST /api/infirmiers/transferts]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'orienter le patient.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
