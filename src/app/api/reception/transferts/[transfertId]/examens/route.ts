import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import {
  listerExamensTransfert,
  modifierExamensTransfert,
} from "@/lib/reception/gestion-examens-dossier";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ transfertId: string }> }
) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { transfertId } = await context.params;
    const resultat = await listerExamensTransfert(transfertId);
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/reception/transferts/[transfertId]/examens]", error);
    const message =
      error instanceof Error ? error.message : "Impossible de charger les examens.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ transfertId: string }> }
) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { transfertId } = await context.params;
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
    console.error("[PUT /api/reception/transferts/[transfertId]/examens]", error);
    let message =
      error instanceof Error ? error.message : "Impossible de modifier les examens.";
    if (message.startsWith("Invalid `prisma.")) {
      message = "Impossible de modifier les examens. Réessayez.";
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
