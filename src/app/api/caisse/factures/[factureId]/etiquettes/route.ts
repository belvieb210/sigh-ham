import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { construireEtiquettesFacture } from "@/lib/caisse/etiquettes-tubes";

interface ContexteRoute {
  params: Promise<{ factureId: string }>;
}

export async function GET(_request: Request, context: ContexteRoute) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { factureId } = await context.params;
  if (!factureId?.trim()) {
    return NextResponse.json({ erreur: "factureId requis." }, { status: 400 });
  }

  try {
    const data = await construireEtiquettesFacture(factureId.trim());
    if (!data) {
      return NextResponse.json({ erreur: "Facture introuvable." }, { status: 404 });
    }
    if (!data.facture.approuvee) {
      return NextResponse.json(
        { erreur: "Approuvez d'abord la facture pour imprimer les codes-barres." },
        { status: 403 }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("[api/caisse/factures/etiquettes]", e);
    return NextResponse.json(
      { erreur: "Impossible de préparer les étiquettes." },
      { status: 500 }
    );
  }
}
