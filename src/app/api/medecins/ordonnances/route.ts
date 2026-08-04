import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  creerOrdonnance,
  listerOrdonnancesMedecins,
} from "@/lib/medecins/gestion-ordonnance";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim() || undefined;
    const ordonnances = await listerOrdonnancesMedecins({ dossierId });
    return NextResponse.json({ ordonnances });
  } catch (e) {
    console.error("[api/medecins/ordonnances GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les ordonnances." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      dossierId?: string;
      notes?: string | null;
      orienterVersPharmacie?: boolean;
      lignes?: {
        medicamentId: string;
        quantite: number;
        posologie?: string | null;
        dureeJours?: number | null;
      }[];
    };

    if (!body.dossierId?.trim() || !Array.isArray(body.lignes)) {
      return NextResponse.json(
        { erreur: "dossierId et lignes requis." },
        { status: 400 }
      );
    }

    const { ordonnance, transfertPharmacie } = await creerOrdonnance(
      session.utilisateur.id,
      {
        dossierId: body.dossierId,
        notes: body.notes,
        lignes: body.lignes,
        orienterVersPharmacie: body.orienterVersPharmacie,
      }
    );

    return NextResponse.json(
      { ordonnance, transfertPharmacie },
      { status: 201 }
    );
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_INTROUVABLE") {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (
      code === "LIGNES_REQUISES" ||
      code === "DOSSIER_ID_REQUIS" ||
      code === "MEDICAMENT_REQUIS" ||
      code === "QUANTITE_INVALIDE" ||
      code === "MEDICAMENT_INVALIDE"
    ) {
      return NextResponse.json(
        { erreur: "Ordonnance invalide : vérifiez les lignes." },
        { status: 400 }
      );
    }
    console.error("[api/medecins/ordonnances POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de créer l'ordonnance." },
      { status: 500 }
    );
  }
}
