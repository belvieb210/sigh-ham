import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  creerConstantesVitales,
  normaliserDonneesConstantes,
} from "@/lib/infirmiers/gestion-constantes";
import { obtenirDetailPatientInfirmiers } from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
  if (!dossierId) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const patient = await obtenirDetailPatientInfirmiers(dossierId);
    if (!patient) {
      return NextResponse.json({ erreur: "Patient introuvable." }, { status: 404 });
    }
    return NextResponse.json({
      constantes: patient.constantesVitales,
      patient,
    });
  } catch (e) {
    console.error("[GET /api/infirmiers/constantes]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les constantes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as Record<string, unknown>;
    const dossierId =
      typeof corps.dossierId === "string" ? corps.dossierId.trim() : "";
    if (!dossierId) {
      return NextResponse.json({ message: "dossierId requis." }, { status: 400 });
    }

    const donnees = normaliserDonneesConstantes(corps);
    const constante = await creerConstantesVitales(
      session.utilisateur.id,
      dossierId,
      donnees
    );

    return NextResponse.json({
      message: "Constantes enregistrées. Orientez le patient vers les médecins.",
      constante,
    });
  } catch (e) {
    console.error("[POST /api/infirmiers/constantes]", e);
    const message =
      e instanceof Error ? e.message : "Impossible d'enregistrer les constantes.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
