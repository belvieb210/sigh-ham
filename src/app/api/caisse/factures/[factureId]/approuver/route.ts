import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { approuverFactureCaisse } from "@/lib/caisse/etiquettes-tubes";

interface ContexteRoute {
  params: Promise<{ factureId: string }>;
}

export async function POST(_request: Request, context: ContexteRoute) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { factureId } = await context.params;
  if (!factureId?.trim()) {
    return NextResponse.json({ erreur: "factureId requis." }, { status: 400 });
  }

  try {
    const resultat = await approuverFactureCaisse(
      factureId.trim(),
      session.utilisateur.id
    );
    if (!resultat.ok) {
      return NextResponse.json({ erreur: resultat.erreur }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "Facture approuvée." });
  } catch (e) {
    console.error("[api/caisse/factures/approuver]", e);
    return NextResponse.json(
      { erreur: "Impossible d'approuver la facture." },
      { status: 500 }
    );
  }
}
