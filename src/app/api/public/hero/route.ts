import { NextResponse } from "next/server";
import { chargerDiapositivesHero } from "@/lib/client/contenu-public";

export async function GET() {
  try {
    const diapositives = await chargerDiapositivesHero();
    return NextResponse.json({ diapositives });
  } catch (error) {
    console.error("[GET /api/public/hero]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
