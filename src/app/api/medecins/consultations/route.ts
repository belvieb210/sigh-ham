import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  creerConsultation,
  listerConsultationsDossier,
  listerConsultationsHistorique,
  obtenirConstantesVitalesDossier,
  obtenirConsultationOuverteDossier,
} from "@/lib/medecins/gestion-consultation";
import type { FormulaireCliniqueMedecins } from "@/lib/medecins/types";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim();
    if (dossierId) {
      const [consultation, historique, constantesVitales] = await Promise.all([
        obtenirConsultationOuverteDossier(dossierId),
        listerConsultationsDossier(dossierId),
        obtenirConstantesVitalesDossier(dossierId),
      ]);
      return NextResponse.json({
        consultation,
        historique,
        constantesVitales,
      });
    }
    const periode =
      searchParams.get("periode") === "semaine" ? "semaine" : "jour";
    const consultations = await listerConsultationsHistorique({ periode });
    return NextResponse.json({ consultations });
  } catch (e) {
    console.error("[api/medecins/consultations GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les consultations." },
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
      motif?: string;
      anamnese?: string | null;
      examenClinique?: string | null;
      conclusion?: string | null;
      formulaireClinique?: FormulaireCliniqueMedecins | null;
    };

    if (!body.dossierId?.trim() || !body.motif?.trim()) {
      return NextResponse.json(
        { erreur: "dossierId et motif requis." },
        { status: 400 }
      );
    }

    const consultation = await creerConsultation(session.utilisateur.id, {
      dossierId: body.dossierId.trim(),
      motif: body.motif,
      anamnese: body.anamnese,
      examenClinique: body.examenClinique,
      conclusion: body.conclusion,
      formulaireClinique: body.formulaireClinique,
    });

    return NextResponse.json({ consultation }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_INTROUVABLE") {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (code === "CONSULTATION_OUVERTE") {
      return NextResponse.json(
        { erreur: "Une consultation est déjà ouverte pour ce dossier." },
        { status: 409 }
      );
    }
    if (code === "MOTIF_REQUIS") {
      return NextResponse.json({ erreur: "Motif requis." }, { status: 400 });
    }
    console.error("[api/medecins/consultations POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de créer la consultation." },
      { status: 500 }
    );
  }
}
