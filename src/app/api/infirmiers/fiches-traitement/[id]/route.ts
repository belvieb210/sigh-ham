import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  cloturerFicheTraitement,
  mettreAJourFicheTraitement,
  normaliserDonneesFicheTraitement,
  obtenirFicheTraitement,
  prolongerFicheTraitement,
} from "@/lib/infirmiers/gestion-fiche-traitement";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const fiche = await obtenirFicheTraitement(id);
    return NextResponse.json({ fiche });
  } catch (e) {
    console.error("[GET /api/infirmiers/fiches-traitement/[id]]", e);
    const message =
      e instanceof Error ? e.message : "Fiche introuvable.";
    return NextResponse.json({ erreur: message }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const corps = (await request.json()) as Record<string, unknown>;
    const donnees = normaliserDonneesFicheTraitement(corps);
    if (!donnees.debutTraitementLe || !donnees.finTraitementLe) {
      return NextResponse.json(
        { message: "Dates de traitement requises." },
        { status: 400 }
      );
    }

    const fiche = await mettreAJourFicheTraitement(id, donnees);
    return NextResponse.json({
      message: "Fiche mise à jour.",
      fiche,
    });
  } catch (e) {
    console.error("[PATCH /api/infirmiers/fiches-traitement/[id]]", e);
    const message =
      e instanceof Error ? e.message : "Impossible de mettre à jour.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const corps = (await request.json()) as { action?: string; jours?: number };

    if (corps.action === "cloturer") {
      const fiche = await cloturerFicheTraitement(id, session.utilisateur.id);
      return NextResponse.json({
        message: "Traitement clôturé.",
        fiche,
      });
    }

    if (corps.action === "prolonger") {
      const jours =
        typeof corps.jours === "number" && corps.jours > 0 ? corps.jours : 3;
      const fiche = await prolongerFicheTraitement(id, jours);
      return NextResponse.json({
        message: `Traitement prolongé de ${jours} jour(s).`,
        fiche,
      });
    }

    return NextResponse.json({ message: "Action invalide." }, { status: 400 });
  } catch (e) {
    console.error("[POST /api/infirmiers/fiches-traitement/[id]]", e);
    const message =
      e instanceof Error ? e.message : "Action impossible.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
