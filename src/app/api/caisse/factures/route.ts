import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import {
  listerFacturesDuJour,
  preparerFactureDossier,
} from "@/lib/caisse/facturation";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const factures = await listerFacturesDuJour();
    return NextResponse.json({ factures });
  } catch (e) {
    console.error("[api/caisse/factures GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les factures." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      factureId?: string;
      devise?: string;
      typeFacture?: "NORMALE" | "PHARMACIE";
    };
    if (!corps.dossierId?.trim()) {
      return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
    }

    const dossier = await preparerFactureDossier(
      corps.dossierId.trim(),
      {
        factureId: corps.factureId?.trim() || undefined,
        devise: corps.devise,
        typeFacture: corps.typeFacture,
      },
      session.utilisateur.id
    );
    if (!dossier) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({
      dossier,
      message: dossier.facture.numeroFacture
        ? `Facture ${dossier.facture.numeroFacture} préparée.`
        : "Facture préparée.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur lors de la préparation de la facture.";
    console.error("[api/caisse/factures POST]", e);
    return NextResponse.json({ erreur: message }, { status: 400 });
  }
}
