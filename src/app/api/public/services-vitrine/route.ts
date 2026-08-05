import { NextResponse } from "next/server";
import { chargerServicesVitrine } from "@/lib/client/contenu-public";

export async function GET() {
  try {
    const services = await chargerServicesVitrine();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("[GET /api/public/services-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
