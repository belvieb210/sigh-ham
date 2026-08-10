import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import {
  creerEstimationMedecinExterneDepuisDossier,
  listerEstimationsMedecinExterne,
  obtenirEstimationActiveMedecinExterneParDossier,
} from "@/lib/medecins-externes/estimations-medecin-externe";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
    if (dossierId) {
      const estimation = await obtenirEstimationActiveMedecinExterneParDossier(
        dossierId,
        medecinExterneId
      );
      return NextResponse.json({ estimation });
    }

    const jourParam = request.nextUrl.searchParams.get("jour");
    const jour = jourParam ? new Date(jourParam) : new Date();
    const resultat = await listerEstimationsMedecinExterne({
      medecinExterneId,
      jour,
    });
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/medecins-externes/estimations]", error);
    return NextResponse.json(
      { message: "Impossible de charger les estimations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const body = (await request.json()) as {
      dossierId?: string;
      transfertId?: string;
      remiseUsd?: number;
    };
    const dossierId = body.dossierId?.trim();
    if (!dossierId) {
      return NextResponse.json({ message: "Dossier requis." }, { status: 400 });
    }

    const estimation = await creerEstimationMedecinExterneDepuisDossier(
      session.utilisateur.id,
      medecinExterneId,
      dossierId,
      {
        transfertId: body.transfertId,
        remiseUsd: body.remiseUsd,
      }
    );

    return NextResponse.json({
      message: "Estimation enregistrée.",
      estimation,
    });
  } catch (error) {
    console.error("[POST /api/medecins-externes/estimations]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de créer l'estimation.",
      },
      { status: 400 }
    );
  }
}
