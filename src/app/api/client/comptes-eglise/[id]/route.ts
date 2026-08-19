import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { mettreAJourCompteEgliseClient } from "@/lib/client/gestion-comptes-partenaires";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const compte = await mettreAJourCompteEgliseClient(id, {
      prenom: body.prenom != null ? String(body.prenom) : undefined,
      nom: body.nom != null ? String(body.nom) : undefined,
      specialite: body.specialite != null ? String(body.specialite) : undefined,
      telephone: body.telephone != null ? String(body.telephone) : undefined,
      email: body.email != null ? String(body.email) : undefined,
      statut:
        body.statut === "ACTIF" || body.statut === "INACTIF"
          ? body.statut
          : undefined,
      motDePasse:
        body.motDePasse != null && String(body.motDePasse).length > 0
          ? String(body.motDePasse)
          : undefined,
      afficherVitrine:
        body.afficherVitrine !== undefined
          ? Boolean(body.afficherVitrine)
          : undefined,
    });
    return NextResponse.json({ compte });
  } catch (error) {
    console.error("[PUT /api/client/comptes-eglise/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de mettre à jour.",
      },
      { status: 400 }
    );
  }
}
