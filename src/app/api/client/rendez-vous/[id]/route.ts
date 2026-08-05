import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import {
  mettreAJourDemandeRdv,
  obtenirDemandeRdv,
} from "@/lib/rdv/gestion-demandes";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const demande = await obtenirDemandeRdv(id);
    if (!demande) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json({ demande });
  } catch (error) {
    console.error("[GET /api/client/rendez-vous/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as {
      statut?: string;
      notes?: string | null;
    };
    const demande = await mettreAJourDemandeRdv(id, body);
    return NextResponse.json({ demande });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "STATUT_INVALIDE") {
      return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
    }
    if (code === "RDV_INTROUVABLE") {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    console.error("[PATCH /api/client/rendez-vous/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
