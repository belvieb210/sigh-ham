import { NextRequest, NextResponse } from "next/server";
import { chargerCampagneParSlug } from "@/lib/client/contenu-public";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  try {
    const campagne = await chargerCampagneParSlug(slug);
    if (!campagne) {
      return NextResponse.json(
        { message: "Introuvable." },
        { status: 404, headers: ENTETES_SANS_CACHE }
      );
    }
    return NextResponse.json(
      {
        campagne: {
          ...campagne,
          statut: calculerStatutCampagne(campagne.dateDebut, campagne.dateFin),
        },
      },
      { headers: ENTETES_SANS_CACHE }
    );
  } catch (error) {
    console.error("[GET /api/public/campagnes/[slug]]", error);
    return NextResponse.json(
      { message: "Erreur." },
      { status: 500, headers: ENTETES_SANS_CACHE }
    );
  }
}
