import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import {
  creerCompteEgliseClient,
  listerComptesEgliseClient,
} from "@/lib/client/gestion-comptes-partenaires";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const comptes = await listerComptesEgliseClient();
    return NextResponse.json({ comptes });
  } catch (error) {
    console.error("[GET /api/client/comptes-eglise]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const compte = await creerCompteEgliseClient({
      identifiant: String(body.identifiant ?? ""),
      motDePasse: String(body.motDePasse ?? ""),
      prenom: String(body.prenom ?? ""),
      nom: String(body.nom ?? ""),
      telephone: body.telephone ? String(body.telephone) : undefined,
      email: body.email ? String(body.email) : undefined,
      afficherVitrine: Boolean(body.afficherVitrine),
    });
    return NextResponse.json({ compte }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/comptes-eglise]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de créer le compte.",
      },
      { status: 400 }
    );
  }
}
