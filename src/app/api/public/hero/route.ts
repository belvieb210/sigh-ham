import { NextResponse } from "next/server";
import { chargerDiapositivesHero } from "@/lib/client/contenu-public";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const diapositives = await chargerDiapositivesHero();
    return NextResponse.json(
      { diapositives },
      { headers: ENTETES_SANS_CACHE }
    );
  } catch (error) {
    console.error("[GET /api/public/hero]", error);
    return NextResponse.json(
      { message: "Erreur." },
      { status: 500, headers: ENTETES_SANS_CACHE }
    );
  }
}
