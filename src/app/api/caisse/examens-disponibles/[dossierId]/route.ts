import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { obtenirDetailExamensFacturePatient } from "@/lib/caisse/detail-examens-facture-patient";

interface Ctx {
  params: Promise<{ dossierId: string }>;
}

/**
 * GET /api/caisse/examens-disponibles/[dossierId]
 * Détail facture : examens Dr approuve vs examens encore indisponibles.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await ctx.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const detail = await obtenirDetailExamensFacturePatient(dossierId.trim());
    if (!detail) {
      return NextResponse.json(
        { erreur: "Facture introuvable pour ce patient." },
        { status: 404 }
      );
    }
    return NextResponse.json({ detail });
  } catch (e) {
    console.error("[GET /api/caisse/examens-disponibles/[dossierId]]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le détail des examens." },
      { status: 500 }
    );
  }
}
