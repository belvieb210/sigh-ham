import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { assertConsultationDuMedecinExterne } from "@/lib/medecins-externes/assert-consultation";
import { ajouterActe } from "@/lib/medecins/gestion-consultation";

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await ctx.params;
    await assertConsultationDuMedecinExterne(id, exigerMedecinExterneId(session.utilisateur.medecinExterneId));
    const body = (await req.json()) as { typeActe?: string; libelle?: string; quantite?: number; notes?: string | null };
    if (!body.typeActe?.trim() || !body.libelle?.trim()) {
      return NextResponse.json({ erreur: "typeActe et libelle requis." }, { status: 400 });
    }
    const acte = await ajouterActe(id, { typeActe: body.typeActe, libelle: body.libelle, quantite: body.quantite, notes: body.notes });
    return NextResponse.json({ acte }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : "Erreur." }, { status: 400 });
  }
}
