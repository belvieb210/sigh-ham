import { NextResponse } from "next/server";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";
import { chargerStatistiquesVitrine } from "@/lib/client/statistiques-vitrine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statistiques = await chargerStatistiquesVitrine();
    return NextResponse.json({ statistiques }, { headers: ENTETES_SANS_CACHE });
  } catch (error) {
    console.error("[GET /api/public/statistiques-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
