import { NextResponse } from "next/server";
import { chargerExamensPublics } from "@/lib/client/charger-examens-public";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const examens = await chargerExamensPublics();
    return NextResponse.json({ examens }, { headers: ENTETES_SANS_CACHE });
  } catch (error) {
    console.error("[GET /api/public/examens]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
