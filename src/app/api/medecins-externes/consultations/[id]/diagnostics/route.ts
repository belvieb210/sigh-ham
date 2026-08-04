import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { assertConsultationDuMedecinExterne } from "@/lib/medecins-externes/assert-consultation";
import { ajouterDiagnostic } from "@/lib/medecins/gestion-consultation";

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await ctx.params;
    await assertConsultationDuMedecinExterne(id, exigerMedecinExterneId(session.utilisateur.medecinExterneId));
    const body = (await req.json()) as { libelle?: string; codeCim?: string | null; principal?: boolean };
    if (!body.libelle?.trim()) return NextResponse.json({ erreur: "libelle requis." }, { status: 400 });
    const diagnostic = await ajouterDiagnostic(id, { libelle: body.libelle, codeCim: body.codeCim, principal: body.principal });
    return NextResponse.json({ diagnostic }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : "Erreur." }, { status: 400 });
  }
}
