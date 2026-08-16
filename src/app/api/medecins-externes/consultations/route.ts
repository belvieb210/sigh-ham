import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import {
  assertDossierDuMedecinExterne,
  exigerMedecinExterneId,
} from "@/lib/medecins-externes/assurer-fiche";
import {
  creerConsultation,
  obtenirConsultationOuverteDossier,
} from "@/lib/medecins/gestion-consultation";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim();
    if (dossierId) {
      await assertDossierDuMedecinExterne(dossierId, medecinExterneId);
      const consultation = await obtenirConsultationOuverteDossier(dossierId);
      return NextResponse.json({ consultation });
    }

    const periode =
      searchParams.get("periode") === "semaine" ? "semaine" : "jour";
    const depuis = new Date();
    if (periode === "semaine") depuis.setDate(depuis.getDate() - 7);
    else depuis.setHours(0, 0, 0, 0);

    const rows = await prisma.consultation.findMany({
      where: {
        medecinId: session.utilisateur.id,
        debutLe: { gte: depuis },
        dossier: {
          salleEnregistrement: "MEDECINS_EXTERNES",
          patient: { medecinExterneId },
        },
      },
      include: {
        medecin: { select: { prenom: true, nom: true } },
        dossier: {
          select: {
            numeroDossier: true,
            patient: { select: { prenom: true, nom: true } },
          },
        },
        _count: { select: { diagnostics: true, actes: true } },
      },
      orderBy: { debutLe: "desc" },
      take: 100,
    });

    return NextResponse.json({
      consultations: rows.map((c) => ({
        id: c.id,
        dossierId: c.dossierId,
        motif: c.motif,
        debutLe: c.debutLe.toISOString(),
        finLe: c.finLe?.toISOString() ?? null,
        medecin: `${c.medecin.prenom} ${c.medecin.nom}`.trim(),
        patient: `${c.dossier.patient.prenom} ${c.dossier.patient.nom}`.trim(),
        numeroDossier: c.dossier.numeroDossier,
        nbDiagnostics: c._count.diagnostics,
        nbActes: c._count.actes,
        conclusion: c.conclusion,
      })),
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    console.error("[api/medecins-externes/consultations GET]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const body = (await req.json()) as {
      dossierId?: string;
      motif?: string;
      anamnese?: string | null;
      examenClinique?: string | null;
      conclusion?: string | null;
    };
    if (!body.dossierId?.trim() || !body.motif?.trim()) {
      return NextResponse.json(
        { erreur: "dossierId et motif requis." },
        { status: 400 }
      );
    }
    await assertDossierDuMedecinExterne(body.dossierId, medecinExterneId);
    const consultation = await creerConsultation(session.utilisateur.id, {
      dossierId: body.dossierId.trim(),
      motif: body.motif,
      anamnese: body.anamnese,
      examenClinique: body.examenClinique,
      conclusion: body.conclusion,
    });
    return NextResponse.json({ consultation }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    if (code === "DOSSIER_INTROUVABLE") {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (code === "CONSULTATION_OUVERTE") {
      return NextResponse.json(
        { erreur: "Une consultation est déjà ouverte." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
