import { NextResponse } from "next/server";
import { chargerCampagnesPubliques } from "@/lib/client/contenu-public";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";

export async function GET() {
  try {
    const campagnes = await chargerCampagnesPubliques({
      seulementPubliees: true,
    });
    return NextResponse.json({
      campagnes: campagnes.map((c) => ({
        ...c,
        statut: calculerStatutCampagne(c.dateDebut, c.dateFin),
      })),
    });
  } catch (error) {
    console.error("[GET /api/public/campagnes]", error);
    return NextResponse.json(
      { message: "Impossible de charger les campagnes." },
      { status: 500 }
    );
  }
}
