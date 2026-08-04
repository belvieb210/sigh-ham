import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { prisma } from "@/lib/prisma";
import {
  listerFournisseurs,
  recevoirAchat,
  upsertFournisseur,
  creerRetourVente,
} from "@/lib/pharmacie/gestion-fournisseurs";
import { rapportStockPharmacie, rapportVentesPharmacie, exporterCsv } from "@/lib/pharmacie/rapports";

export async function GET(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "stock";

  try {
    if (type === "fournisseurs") {
      return NextResponse.json({ fournisseurs: await listerFournisseurs() });
    }
    if (type === "lots") {
      const lots = await prisma.lotMedicament.findMany({
        include: { medicament: true, fournisseur: true },
        orderBy: { expirationLe: "asc" },
        take: 200,
      });
      return NextResponse.json({
        lots: lots.map((l) => ({
          id: l.id,
          numeroLot: l.numeroLot,
          medicamentId: l.medicamentId,
          medicamentNom: l.medicament.nom,
          quantite: l.quantite,
          expirationLe: l.expirationLe.toISOString(),
          fournisseur: l.fournisseur?.nom ?? null,
        })),
      });
    }
    if (type === "rapport-ventes") {
      const rapport = await rapportVentesPharmacie();
      if (url.searchParams.get("format") === "csv") {
        const csv = exporterCsv(
          ["numero", "client", "statut", "montant", "date"],
          rapport.ventes.map((v) => [
            v.numero,
            v.client,
            v.statut,
            v.montant,
            v.creeLe,
          ])
        );
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="ventes-pharmacie.csv"',
          },
        });
      }
      if (url.searchParams.get("format") === "pdf") {
        const { genererPdfRapportVentes } = await import(
          "@/lib/pharmacie/rapport-pdf"
        );
        const buffer = await genererPdfRapportVentes({
          hopital: "HAM LABORATOIRE",
          titre: "Rapport ventes pharmacie",
          periode: `${rapport.depuis} → ${rapport.jusqua}`,
          chiffreAffaires: rapport.chiffreAffaires,
          nombreVentes: rapport.nombreVentes,
          topProduits: rapport.topProduits,
          ventes: rapport.ventes,
        });
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition":
              'attachment; filename="ventes-pharmacie.pdf"',
          },
        });
      }
      return NextResponse.json({ rapport });
    }
    if (type === "rapport-stock") {
      return NextResponse.json({ rapport: await rapportStockPharmacie() });
    }
    return NextResponse.json({ rapport: await rapportStockPharmacie() });
  } catch (e) {
    console.error("[api/pharmacie/stock]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as Record<string, unknown>;
    const action = corps.action as string;

    if (action === "fournisseur") {
      const f = await upsertFournisseur({
        id: typeof corps.id === "string" ? corps.id : undefined,
        nom: String(corps.nom ?? ""),
        telephone: corps.telephone as string | undefined,
        email: corps.email as string | undefined,
        adresse: corps.adresse as string | undefined,
      });
      return NextResponse.json({ message: "Fournisseur enregistré.", fournisseur: f });
    }
    if (action === "achat") {
      const achat = await recevoirAchat(session.utilisateur.id, {
        fournisseurId: String(corps.fournisseurId ?? ""),
        notes: corps.notes as string | undefined,
        lignes: (corps.lignes as never) ?? [],
      });
      return NextResponse.json({ message: "Achat reçu — stock mis à jour.", achat });
    }
    if (action === "retour") {
      const retour = await creerRetourVente(
        session.utilisateur.id,
        String(corps.venteId ?? ""),
        (corps.lignes as never) ?? [],
        corps.motif as string | undefined
      );
      return NextResponse.json({ message: "Retour enregistré.", retour });
    }
    return NextResponse.json({ message: "Action inconnue." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
