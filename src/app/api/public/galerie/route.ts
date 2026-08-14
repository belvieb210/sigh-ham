import { NextResponse } from "next/server";
import { chargerGaleriePublique } from "@/lib/client/contenu-public";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const medias = await chargerGaleriePublique();
    return NextResponse.json({ medias }, { headers: ENTETES_SANS_CACHE });
  } catch (error) {
    console.error("[GET /api/public/galerie]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
