import { NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { obtenirDetailExamensFacturePatient } from "@/lib/caisse/detail-examens-facture-patient";
import { assertDossierEglise } from "@/lib/eglise/assert-dossier-eglise";

interface Ctx {
  params: Promise<{ dossierId: string }>;
}

/**
 * GET /api/eglise/examens-disponibles/[dossierId]
 * Détail facture (dossiers du service Église uniquement).
 */
export async function GET(_request: Request, ctx: Ctx) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await ctx.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    await assertDossierEglise(dossierId.trim());

    const detail = await obtenirDetailExamensFacturePatient(dossierId.trim());
    if (!detail) {
      return NextResponse.json(
        { erreur: "Facture introuvable pour ce patient." },
        { status: 404 }
      );
    }
    return NextResponse.json({ detail });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Patient non autorisé." }, { status: 403 });
    }
    console.error("[GET /api/eglise/examens-disponibles/[dossierId]]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le détail des examens." },
      { status: 500 }
    );
  }
}
