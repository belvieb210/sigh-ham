import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  listerExamensDossierMedecins,
  listerTypesExamenMedecins,
  prescrireExamensMedecins,
} from "@/lib/medecins/prescrire-examens";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("types") === "1") {
      const types = await listerTypesExamenMedecins();
      return NextResponse.json({ types });
    }

    const dossierId = searchParams.get("dossierId")?.trim();
    if (!dossierId) {
      return NextResponse.json(
        { erreur: "dossierId ou types=1 requis." },
        { status: 400 }
      );
    }

    const examens = await listerExamensDossierMedecins(dossierId);
    return NextResponse.json({ examens });
  } catch (e) {
    console.error("[api/medecins/examens GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les examens." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      dossierId?: string;
      typeExamenIds?: string[];
      notes?: string | null;
    };

    if (!body.dossierId?.trim() || !Array.isArray(body.typeExamenIds)) {
      return NextResponse.json(
        { erreur: "dossierId et typeExamenIds requis." },
        { status: 400 }
      );
    }

    const examens = await prescrireExamensMedecins(session.utilisateur.id, {
      dossierId: body.dossierId,
      typeExamenIds: body.typeExamenIds,
      notes: body.notes,
    });

    return NextResponse.json({ examens }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_INTROUVABLE") {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (code === "TYPES_REQUIS" || code === "DOSSIER_ID_REQUIS") {
      return NextResponse.json(
        { erreur: "Sélectionnez au moins un type d'examen." },
        { status: 400 }
      );
    }
    if (code === "TYPES_INVALIDES") {
      return NextResponse.json(
        { erreur: "Un ou plusieurs types d'examen sont invalides." },
        { status: 400 }
      );
    }
    console.error("[api/medecins/examens POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de prescrire les examens." },
      { status: 500 }
    );
  }
}
