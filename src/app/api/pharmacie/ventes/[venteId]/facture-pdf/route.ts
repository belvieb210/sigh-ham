import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { genererPdfFacturePharmacieVente } from "@/lib/pharmacie/generer-facture-pharmacie-pdf";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ venteId: string }> }
) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { venteId } = await context.params;
    const pdf = await genererPdfFacturePharmacieVente(venteId);
    if (!pdf) {
      return NextResponse.json(
        { message: "Facture introuvable ou vente non payée." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(pdf.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdf.nomFichier}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[GET /api/pharmacie/ventes/[venteId]/facture-pdf]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "PDF indisponible." },
      { status: 500 }
    );
  }
}
