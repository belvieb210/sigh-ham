import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import {
  creerCompteMedecinExterneClient,
  listerComptesMedecinsExternesClient,
} from "@/lib/client/gestion-comptes-partenaires";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const comptes = await listerComptesMedecinsExternesClient();
    return NextResponse.json({ comptes });
  } catch (error) {
    console.error("[GET /api/client/comptes-medecins-externes]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const compte = await creerCompteMedecinExterneClient({
      identifiant: String(body.identifiant ?? ""),
      motDePasse: String(body.motDePasse ?? ""),
      prenom: String(body.prenom ?? ""),
      nom: String(body.nom ?? ""),
      specialite: body.specialite ? String(body.specialite) : undefined,
      telephone: body.telephone ? String(body.telephone) : undefined,
      email: body.email ? String(body.email) : undefined,
      numeroOrdre: body.numeroOrdre ? String(body.numeroOrdre) : undefined,
      afficherVitrine: Boolean(body.afficherVitrine),
    });
    return NextResponse.json({ compte }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/comptes-medecins-externes]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de créer le compte.",
      },
      { status: 400 }
    );
  }
}
