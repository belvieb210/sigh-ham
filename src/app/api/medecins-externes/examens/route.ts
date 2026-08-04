import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import {
  assertDossierDuMedecinExterne,
  exigerMedecinExterneId,
} from "@/lib/medecins-externes/assurer-fiche";
import {
  listerExamensDossierMedecins,
  listerTypesExamenMedecins,
  prescrireExamensMedecins,
} from "@/lib/medecins/prescrire-examens";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { searchParams } = new URL(req.url);
    if (searchParams.get("types") === "1") {
      return NextResponse.json({ types: await listerTypesExamenMedecins() });
    }
    const dossierId = searchParams.get("dossierId")?.trim();
    if (!dossierId) {
      return NextResponse.json(
        { erreur: "dossierId ou types=1 requis." },
        { status: 400 }
      );
    }
    await assertDossierDuMedecinExterne(dossierId, medecinExterneId);
    return NextResponse.json({
      examens: await listerExamensDossierMedecins(dossierId),
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
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
      typeExamenIds?: string[];
      notes?: string | null;
      orienterVersCaisse?: boolean;
    };

    if (!body.dossierId?.trim() || !Array.isArray(body.typeExamenIds)) {
      return NextResponse.json(
        { erreur: "dossierId et typeExamenIds requis." },
        { status: 400 }
      );
    }

    await assertDossierDuMedecinExterne(body.dossierId, medecinExterneId);
    const examens = await prescrireExamensMedecins(session.utilisateur.id, {
      dossierId: body.dossierId,
      typeExamenIds: body.typeExamenIds,
      notes: body.notes,
    });

    let transfertCaisse: { ok: boolean; message?: string } | undefined;
    if (body.orienterVersCaisse !== false) {
      try {
        await reorienterPatientDepuisMedecinsExternes(
          session.utilisateur.id,
          medecinExterneId,
          body.dossierId,
          ["CAISSE"]
        );
        transfertCaisse = { ok: true };
      } catch (e) {
        transfertCaisse = {
          ok: false,
          message: e instanceof Error ? e.message : "Orientation caisse impossible.",
        };
      }
    }

    return NextResponse.json({ examens, transfertCaisse }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
