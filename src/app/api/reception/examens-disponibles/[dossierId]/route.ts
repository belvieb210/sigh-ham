import { NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { obtenirDetailExamensFacturePatient } from "@/lib/caisse/detail-examens-facture-patient";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ dossierId: string }>;
}

/**
 * GET /api/reception/examens-disponibles/[dossierId]
 * Détail facture : examens Dr approuve vs examens encore indisponibles.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { dossierId } = await ctx.params;
  if (!dossierId?.trim()) {
    return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
  }

  try {
    const dossier = await prisma.dossierPatient.findFirst({
      where: { id: dossierId.trim(), salleEnregistrement: "RECEPTION" },
      select: { id: true },
    });
    if (!dossier) {
      return NextResponse.json({ erreur: "Patient non autorisé." }, { status: 403 });
    }

    const detail = await obtenirDetailExamensFacturePatient(dossierId.trim());
    if (!detail) {
      return NextResponse.json(
        { erreur: "Facture introuvable pour ce patient." },
        { status: 404 }
      );
    }
    return NextResponse.json({ detail });
  } catch (e) {
    console.error("[GET /api/reception/examens-disponibles/[dossierId]]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le détail des examens." },
      { status: 500 }
    );
  }
}
