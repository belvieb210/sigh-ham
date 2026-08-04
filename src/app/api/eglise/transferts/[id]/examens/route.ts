import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import {
  listerExamensTransfert,
  modifierExamensTransfert,
} from "@/lib/reception/gestion-examens-dossier";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    return NextResponse.json(await listerExamensTransfert(id));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossible de charger.",
      },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { examensIds?: string[] };
    if (!Array.isArray(body.examensIds)) {
      return NextResponse.json({ message: "Liste invalide." }, { status: 400 });
    }
    const resultat = await modifierExamensTransfert(
      session.utilisateur.id,
      id,
      body.examensIds.map(String)
    );
    return NextResponse.json({ message: "Examens mis à jour.", ...resultat });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Modification impossible.",
      },
      { status: 400 }
    );
  }
}
