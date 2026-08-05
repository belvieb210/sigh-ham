import { NextRequest, NextResponse } from "next/server";
import { chargerCampagneParSlug } from "@/lib/client/contenu-public";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  try {
    const campagne = await chargerCampagneParSlug(slug);
    if (!campagne) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json({
      campagne: {
        ...campagne,
        statut: calculerStatutCampagne(campagne.dateDebut, campagne.dateFin),
      },
    });
  } catch (error) {
    console.error("[GET /api/public/campagnes/[slug]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
