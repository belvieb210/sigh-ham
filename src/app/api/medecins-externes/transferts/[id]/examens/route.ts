import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import {
  listerExamensTransfert,
  modifierExamensTransfert,
} from "@/lib/reception/gestion-examens-dossier";
import { prisma } from "@/lib/prisma";

async function assertTransfertDuMedecin(
  transfertId: string,
  medecinExterneId: string
) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    select: {
      id: true,
      dossier: { select: { patient: { select: { medecinExterneId: true } } } },
    },
  });
  if (!transfert) throw new Error("Transfert introuvable.");
  if (transfert.dossier.patient.medecinExterneId !== medecinExterneId) {
    throw new Error("Accès refusé à ce transfert.");
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { id: transfertId } = await context.params;
    await assertTransfertDuMedecin(transfertId, medecinExterneId);
    const resultat = await listerExamensTransfert(transfertId);
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/medecins-externes/transferts/[id]/examens]", error);
    const message =
      error instanceof Error ? error.message : "Impossible de charger les examens.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { id: transfertId } = await context.params;
    await assertTransfertDuMedecin(transfertId, medecinExterneId);
    const body = (await request.json()) as { examensIds?: string[] };

    if (!Array.isArray(body.examensIds)) {
      return NextResponse.json({ message: "Liste d'examens invalide." }, { status: 400 });
    }

    const resultat = await modifierExamensTransfert(
      session.utilisateur.id,
      transfertId,
      body.examensIds.map(String)
    );

    return NextResponse.json({
      message: "Examens mis à jour.",
      ...resultat,
    });
  } catch (error) {
    console.error("[PUT /api/medecins-externes/transferts/[id]/examens]", error);
    let message =
      error instanceof Error ? error.message : "Impossible de modifier les examens.";
    if (message.startsWith("Invalid `prisma.")) {
      message = "Impossible de modifier les examens. Réessayez.";
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
