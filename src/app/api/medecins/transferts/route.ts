import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerPatientsTransferesSortantsMedecins } from "@/lib/medecins/listes-complementaires";
import { reorienterPatientDepuisMedecins } from "@/lib/medecins/reorienter-patient-medecins";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }
  try {
    const patients = await listerPatientsTransferesSortantsMedecins();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[GET /api/medecins/transferts]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les patients transférés." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiMedecins();
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

    const resultat = await reorienterPatientDepuisMedecins(
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
    console.error("[POST /api/medecins/transferts]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'orienter le patient.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
