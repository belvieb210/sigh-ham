import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { supprimerActe } from "@/lib/medecins/gestion-consultation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    await supprimerActe(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "ACTE_INTROUVABLE") {
      return NextResponse.json({ erreur: "Acte introuvable." }, { status: 404 });
    }
    if (code === "CONSULTATION_CLOTUREE") {
      return NextResponse.json(
        { erreur: "Consultation déjà clôturée." },
        { status: 409 }
      );
    }
    console.error("[api/medecins/actes/[id] DELETE]", e);
    return NextResponse.json(
      { erreur: "Impossible de supprimer l'acte." },
      { status: 500 }
    );
  }
}
