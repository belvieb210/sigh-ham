import { NextResponse } from "next/server";
import { obtenirBrandingEtablissement } from "@/lib/admin/parametres";

/** Branding public (login / shells) — pas de secrets. */
export async function GET() {
  try {
    const branding = await obtenirBrandingEtablissement();
    return NextResponse.json({ branding });
  } catch (error) {
    console.error("[GET /api/public/branding]", error);
    return NextResponse.json(
      { message: "Impossible de charger le branding." },
      { status: 500 }
    );
  }
}
