import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { prisma } from "@/lib/prisma";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { assertConsultationDuMedecinExterne } from "@/lib/medecins-externes/assert-consultation";
import { supprimerActe } from "@/lib/medecins/gestion-consultation";

interface Ctx { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await ctx.params;
    const a = await prisma.prescriptionActe.findUnique({ where: { id }, select: { consultationId: true } });
    if (!a) return NextResponse.json({ erreur: "Acte introuvable." }, { status: 404 });
    await assertConsultationDuMedecinExterne(a.consultationId, exigerMedecinExterneId(session.utilisateur.medecinExterneId));
    await supprimerActe(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : "Erreur." }, { status: 400 });
  }
}
