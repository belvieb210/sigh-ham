import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import {
  creerVenteDirecte,
  delivrerVente,
  transmettreVenteACaisse,
} from "@/lib/pharmacie/gestion-ventes";
import { listerVentes } from "@/lib/pharmacie/gestion-ordonnances";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const statut = request.nextUrl.searchParams.get("statut");
  const statuts = statut ? statut.split(",") : undefined;
  try {
    const ventes = await listerVentes(statuts);
    return NextResponse.json({ ventes });
  } catch (e) {
    console.error("[api/pharmacie/ventes]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as {
      action?: "creer" | "transmettre" | "delivrer";
      venteId?: string;
      dossierId?: string;
      notes?: string;
      lignes?: { medicamentId: string; quantite: number; remise?: number }[];
    };

    if (corps.action === "transmettre" && corps.venteId) {
      const r = await transmettreVenteACaisse(session.utilisateur.id, corps.venteId);
      return NextResponse.json({
        message: `Facture ${r.facture.numeroFacture} transmise à la caisse.`,
        facture: r.facture,
        vente: r.vente,
      });
    }
    if (corps.action === "delivrer" && corps.venteId) {
      const d = await delivrerVente(session.utilisateur.id, corps.venteId);
      return NextResponse.json({ message: "Médicaments remis.", delivrance: d });
    }
    if (!corps.dossierId || !corps.lignes?.length) {
      return NextResponse.json(
        { message: "dossierId et lignes requis." },
        { status: 400 }
      );
    }
    const vente = await creerVenteDirecte(session.utilisateur.id, {
      dossierId: corps.dossierId,
      notes: corps.notes,
      lignes: corps.lignes,
    });
    return NextResponse.json({ message: "Vente créée.", vente });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
