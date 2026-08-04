import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  creerAdmission,
  listerAdmissionsMedecins,
  sortirAdmission,
} from "@/lib/medecins/gestion-admission";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const activesSeulement = searchParams.get("actives") !== "0";
    const admissions = await listerAdmissionsMedecins({ activesSeulement });
    return NextResponse.json({ admissions });
  } catch (e) {
    console.error("[api/medecins/admissions GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les admissions." },
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
      litId?: string;
      motif?: string;
      notes?: string | null;
    };

    if (!body.dossierId?.trim() || !body.litId?.trim() || !body.motif?.trim()) {
      return NextResponse.json(
        { erreur: "dossierId, litId et motif requis." },
        { status: 400 }
      );
    }

    const admission = await creerAdmission({
      dossierId: body.dossierId,
      litId: body.litId,
      motif: body.motif,
      notes: body.notes,
    });

    return NextResponse.json({ admission }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_INTROUVABLE" || code === "LIT_INTROUVABLE") {
      return NextResponse.json({ erreur: "Ressource introuvable." }, { status: 404 });
    }
    if (code === "ADMISSION_ACTIVE") {
      return NextResponse.json(
        { erreur: "Le patient a déjà une admission active." },
        { status: 409 }
      );
    }
    if (code === "LIT_OCCUPE") {
      return NextResponse.json({ erreur: "Ce lit est occupé." }, { status: 409 });
    }
    if (code === "CHAMPS_REQUIS") {
      return NextResponse.json({ erreur: "Champs requis manquants." }, { status: 400 });
    }
    console.error("[api/medecins/admissions POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de créer l'admission." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      action?: string;
    };

    if (!body.id?.trim() || body.action !== "sortir") {
      return NextResponse.json(
        { erreur: "id et action=sortir requis." },
        { status: 400 }
      );
    }

    const admission = await sortirAdmission(body.id.trim());
    return NextResponse.json({ admission });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "ADMISSION_INTROUVABLE") {
      return NextResponse.json(
        { erreur: "Admission introuvable." },
        { status: 404 }
      );
    }
    if (code === "DEJA_SORTI") {
      return NextResponse.json(
        { erreur: "Admission déjà clôturée." },
        { status: 409 }
      );
    }
    console.error("[api/medecins/admissions PATCH]", e);
    return NextResponse.json(
      { erreur: "Impossible de sortir l'admission." },
      { status: 500 }
    );
  }
}
