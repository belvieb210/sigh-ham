import { NextResponse } from "next/server";
import { chargerCampagnesPubliques } from "@/lib/client/contenu-public";
import { ENTETES_SANS_CACHE } from "@/lib/client/invalider-cache-vitrine";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const campagnes = await chargerCampagnesPubliques({
      seulementPubliees: true,
    });
    return NextResponse.json(
      {
        campagnes: campagnes.map((c) => ({
          ...c,
          statut: calculerStatutCampagne(c.dateDebut, c.dateFin),
        })),
      },
      { headers: ENTETES_SANS_CACHE }
    );
  } catch (error) {
    console.error("[GET /api/public/campagnes]", error);
    return NextResponse.json(
      { message: "Impossible de charger les campagnes." },
      { status: 500, headers: ENTETES_SANS_CACHE }
    );
  }
}
