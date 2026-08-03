import { NextResponse } from "next/server";
import type { ModePaiement } from "@/generated/prisma/client";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { encaisserFacture } from "@/lib/caisse/facturation";
import type {
  DestinationApresEncaissement,
  ModeFactureCaisse,
} from "@/lib/caisse/types";

const MODES_PAIEMENT: ModePaiement[] = [
  "ESPECES",
  "MOBILE_MONEY",
  "CARTE",
  "VIREMENT",
  "CHEQUE",
];

const MODES_FACTURE: ModeFactureCaisse[] = [
  "CASH",
  "AVANCE",
  "SOLDE",
  "PRISE_EN_CHARGE",
  "ABONNE",
  "CONVENTIONNE",
];

const DESTINATIONS: DestinationApresEncaissement[] = [
  "LABORATOIRE",
  "PHARMACIE",
  "AUCUNE",
];

export async function POST(request: Request) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      montant?: number;
      modePaiement?: string;
      modeFacture?: string;
      remise?: number;
      fraisDivers?: number;
      devise?: string;
      reference?: string;
      destinationApres?: string;
    };

    if (!corps.dossierId?.trim()) {
      return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
    }

    const montant = Number(corps.montant);
    if (!Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json({ erreur: "Montant invalide." }, { status: 400 });
    }

    if (!corps.modePaiement || !MODES_PAIEMENT.includes(corps.modePaiement as ModePaiement)) {
      return NextResponse.json({ erreur: "Mode de paiement invalide." }, { status: 400 });
    }

    const modeFacture = (corps.modeFacture ?? "CASH") as ModeFactureCaisse;
    if (!MODES_FACTURE.includes(modeFacture)) {
      return NextResponse.json({ erreur: "Mode de facture invalide." }, { status: 400 });
    }

    const destinationApres = (corps.destinationApres ?? "LABORATOIRE") as DestinationApresEncaissement;
    if (!DESTINATIONS.includes(destinationApres)) {
      return NextResponse.json({ erreur: "Destination invalide." }, { status: 400 });
    }

    const resultat = await encaisserFacture(session.utilisateur.id, {
      dossierId: corps.dossierId.trim(),
      montant,
      modePaiement: corps.modePaiement as ModePaiement,
      modeFacture,
      remise: Number(corps.remise) || 0,
      fraisDivers: Number(corps.fraisDivers) || 0,
      devise: corps.devise === "USD" ? "USD" : "CDF",
      reference: corps.reference,
      destinationApres,
    });

    return NextResponse.json({
      ...resultat,
      message: resultat.numeroFacture
        ? `Facture ${resultat.numeroFacture} enregistrée.`
        : "Facture enregistrée.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur lors de l'encaissement.";
    console.error("[api/caisse/factures/encaisser]", e);
    return NextResponse.json({ erreur: message }, { status: 400 });
  }
}
