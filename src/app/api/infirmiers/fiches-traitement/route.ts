import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  creerFicheTraitement,
  listerFichesTraitementActives,
  listerFichesTraitementDossier,
  normaliserDonneesFicheTraitement,
} from "@/lib/infirmiers/gestion-fiche-traitement";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
    if (dossierId) {
      const fiches = await listerFichesTraitementDossier(dossierId);
      return NextResponse.json({ fiches });
    }

    const fiches = await listerFichesTraitementActives();
    return NextResponse.json({ fiches });
  } catch (e) {
    console.error("[GET /api/infirmiers/fiches-traitement]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les fiches." },
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

    const donnees = normaliserDonneesFicheTraitement(corps);
    if (!donnees.debutTraitementLe || !donnees.finTraitementLe) {
      return NextResponse.json(
        { message: "Dates de traitement requises." },
        { status: 400 }
      );
    }

    const fiche = await creerFicheTraitement(
      session.utilisateur.id,
      dossierId,
      donnees
    );

    return NextResponse.json({
      message: "Fiche de traitement créée.",
      fiche,
    });
  } catch (e) {
    console.error("[POST /api/infirmiers/fiches-traitement]", e);
    const message =
      e instanceof Error ? e.message : "Impossible de créer la fiche.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
