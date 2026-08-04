import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { ajouterDiagnostic } from "@/lib/medecins/gestion-consultation";

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
      libelle?: string;
      codeCim?: string | null;
      principal?: boolean;
    };

    if (!body.libelle?.trim()) {
      return NextResponse.json({ erreur: "libelle requis." }, { status: 400 });
    }

    const diagnostic = await ajouterDiagnostic(id, {
      libelle: body.libelle,
      codeCim: body.codeCim,
      principal: body.principal,
    });

    return NextResponse.json({ diagnostic }, { status: 201 });
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
    console.error("[api/medecins/consultations/[id]/diagnostics]", e);
    return NextResponse.json(
      { erreur: "Impossible d'ajouter le diagnostic." },
      { status: 500 }
    );
  }
}
