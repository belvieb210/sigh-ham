import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { obtenirDetailExamensFacturePatient } from "@/lib/caisse/detail-examens-facture-patient";
import {
  assertDossierDuMedecinExterne,
  exigerMedecinExterneId,
} from "@/lib/medecins-externes/assurer-fiche";

interface Ctx {
  params: Promise<{ dossierId: string }>;
}

/**
 * GET /api/medecins-externes/examens-disponibles/[dossierId]
 * Détail facture (patients du médecin externe uniquement).
 */
export async function GET(_request: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await ctx.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    await assertDossierDuMedecinExterne(dossierId.trim(), medecinExterneId);

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
    if (msg === "DOSSIER_INTROUVABLE" || msg === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Patient non autorisé." }, { status: 403 });
    }
    console.error(
      "[GET /api/medecins-externes/examens-disponibles/[dossierId]]",
      e
    );
    return NextResponse.json(
      { erreur: "Impossible de charger le détail des examens." },
      { status: 500 }
    );
  }
}
