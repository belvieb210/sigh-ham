import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import {
  creerEstimationDepuisDossier,
  listerEstimationsConvention,
  obtenirEstimationActiveParDossier,
} from "@/lib/eglise/estimations-convention";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const dossierId = request.nextUrl.searchParams.get("dossierId")?.trim();
    if (dossierId) {
      const estimation = await obtenirEstimationActiveParDossier(dossierId);
      return NextResponse.json({ estimation });
    }

    const jourParam = request.nextUrl.searchParams.get("jour");
    const jour = jourParam ? new Date(jourParam) : new Date();
    const resultat = await listerEstimationsConvention({
      emetteurId: session.utilisateur.id,
      jour,
    });
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/eglise/estimations]", error);
    return NextResponse.json(
      { message: "Impossible de charger les estimations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      dossierId?: string;
      transfertId?: string;
      nomConvention?: string;
      remiseUsd?: number;
    };
    const dossierId = body.dossierId?.trim();
    if (!dossierId) {
      return NextResponse.json({ message: "Dossier requis." }, { status: 400 });
    }

    const estimation = await creerEstimationDepuisDossier(
      session.utilisateur.id,
      dossierId,
      {
        transfertId: body.transfertId,
        nomConvention: body.nomConvention,
        remiseUsd: body.remiseUsd,
      }
    );

    return NextResponse.json({
      message: "Estimation enregistrée.",
      estimation,
    });
  } catch (error) {
    console.error("[POST /api/eglise/estimations]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de créer l'estimation.",
      },
      { status: 400 }
    );
  }
}
