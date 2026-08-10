import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { genererPdfFicheTraitement } from "@/lib/infirmiers/generer-fiche-traitement-pdf";
import {
  listerFichesTraitementDossier,
  obtenirFicheTraitement,
} from "@/lib/infirmiers/gestion-fiche-traitement";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function nomHopital(): Promise<string> {
  try {
    const param = await prisma.parametreSysteme.findUnique({
      where: { cle: "nom_etablissement" },
    });
    return param?.valeur?.trim() || "HAM Laboratoire";
  } catch {
    return "HAM Laboratoire";
  }
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const fiche = await obtenirFicheTraitement(id);
    const historique = await listerFichesTraitementDossier(fiche.dossierId);
    const hopital = await nomHopital();

    const buffer = await genererPdfFicheTraitement({
      hopital,
      fiche,
      historique,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fiche-traitement-${fiche.numeroDossier}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[GET /api/infirmiers/fiches-traitement/[id]/pdf]", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "PDF indisponible." },
      { status: 404 }
    );
  }
}
