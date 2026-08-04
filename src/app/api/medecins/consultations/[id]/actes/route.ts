import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { ajouterActe } from "@/lib/medecins/gestion-consultation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      typeActe?: string;
      libelle?: string;
      quantite?: number;
      notes?: string | null;
    };

    if (!body.typeActe?.trim() || !body.libelle?.trim()) {
      return NextResponse.json(
        { erreur: "typeActe et libelle requis." },
        { status: 400 }
      );
    }

    const acte = await ajouterActe(id, {
      typeActe: body.typeActe,
      libelle: body.libelle,
      quantite: body.quantite,
      notes: body.notes,
    });

    return NextResponse.json({ acte }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "CONSULTATION_INTROUVABLE") {
      return NextResponse.json(
        { erreur: "Consultation introuvable." },
        { status: 404 }
      );
    }
    if (code === "CONSULTATION_CLOTUREE") {
      return NextResponse.json(
        { erreur: "Consultation déjà clôturée." },
        { status: 409 }
      );
    }
    if (code === "ACTE_INVALIDE" || code === "QUANTITE_INVALIDE") {
      return NextResponse.json({ erreur: "Acte invalide." }, { status: 400 });
    }
    console.error("[api/medecins/consultations/[id]/actes]", e);
    return NextResponse.json(
      { erreur: "Impossible d'ajouter l'acte." },
      { status: 500 }
    );
  }
}
