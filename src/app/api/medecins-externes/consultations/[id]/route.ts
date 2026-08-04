import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { assertConsultationDuMedecinExterne } from "@/lib/medecins-externes/assert-consultation";
import {
  cloturerConsultation,
  mettreAJourConsultation,
  obtenirConsultationMedecins,
} from "@/lib/medecins/gestion-consultation";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await ctx.params;
    await assertConsultationDuMedecinExterne(id, exigerMedecinExterneId(session.utilisateur.medecinExterneId));
    const consultation = await obtenirConsultationMedecins(id);
    if (!consultation) return NextResponse.json({ erreur: "Consultation introuvable." }, { status: 404 });
    return NextResponse.json({ consultation });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const { id } = await ctx.params;
    await assertConsultationDuMedecinExterne(id, exigerMedecinExterneId(session.utilisateur.medecinExterneId));
    const body = (await req.json()) as { action?: string; motif?: string; anamnese?: string | null; examenClinique?: string | null; conclusion?: string | null };
    if (body.action === "cloturer") {
      return NextResponse.json({ consultation: await cloturerConsultation(id) });
    }
    return NextResponse.json({
      consultation: await mettreAJourConsultation(id, {
        motif: body.motif,
        anamnese: body.anamnese,
        examenClinique: body.examenClinique,
        conclusion: body.conclusion,
      }),
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    return NextResponse.json({ erreur: e instanceof Error ? e.message : "Erreur." }, { status: 400 });
  }
}
