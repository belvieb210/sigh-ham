import { NextResponse } from "next/server";
import { chargerGouvernancePubliquePourSite } from "@/lib/admin/gouvernance-publique";

export async function GET() {
  try {
    const gouvernance = await chargerGouvernancePubliquePourSite();
    return NextResponse.json(gouvernance);
  } catch (error) {
    console.error("[GET /api/public/gouvernance]", error);
    return NextResponse.json(
      { message: "Impossible de charger la gouvernance publique." },
      { status: 500 }
    );
  }
}
