import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  cloturerConsultation,
  mettreAJourConsultation,
  obtenirConsultationMedecins,
} from "@/lib/medecins/gestion-consultation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const consultation = await obtenirConsultationMedecins(id);
    if (!consultation) {
      return NextResponse.json(
        { erreur: "Consultation introuvable." },
        { status: 404 }
      );
    }
    return NextResponse.json({ consultation });
  } catch (e) {
    console.error("[api/medecins/consultations/[id] GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la consultation." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      action?: string;
      motif?: string;
      anamnese?: string | null;
      examenClinique?: string | null;
      conclusion?: string | null;
    };

    if (body.action === "cloturer") {
      const consultation = await cloturerConsultation(id);
      return NextResponse.json({ consultation });
    }

    const consultation = await mettreAJourConsultation(id, {
      motif: body.motif,
      anamnese: body.anamnese,
      examenClinique: body.examenClinique,
      conclusion: body.conclusion,
    });

    return NextResponse.json({ consultation });
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
    if (code === "MOTIF_REQUIS") {
      return NextResponse.json({ erreur: "Motif requis." }, { status: 400 });
    }
    console.error("[api/medecins/consultations/[id] PATCH]", e);
    return NextResponse.json(
      { erreur: "Impossible de mettre à jour la consultation." },
      { status: 500 }
    );
  }
}
