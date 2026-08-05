import { NextResponse } from "next/server";
import { chargerMedecinsVitrine } from "@/lib/client/contenu-public";

export async function GET() {
  try {
    const medecins = await chargerMedecinsVitrine();
    return NextResponse.json({ medecins });
  } catch (error) {
    console.error("[GET /api/public/medecins-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
