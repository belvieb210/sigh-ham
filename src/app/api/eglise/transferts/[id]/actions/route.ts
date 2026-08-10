import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import {
  confirmerTransfertEglise,
  recupererTransfertEglise,
  rejeterTransfertEglise,
} from "@/lib/eglise/gestion-transfert";

type ActionTransfert = "confirmer" | "rejeter" | "recuperer";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id: transfertId } = await context.params;
    const body = (await request.json()) as {
      action?: ActionTransfert;
      motifRejet?: string;
    };
    const action = body.action;
    if (!action || !["confirmer", "rejeter", "recuperer"].includes(action)) {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }

    let resultat;
    switch (action) {
      case "confirmer":
        resultat = await confirmerTransfertEglise(session.utilisateur.id, transfertId);
        break;
      case "rejeter":
        resultat = await rejeterTransfertEglise(
          session.utilisateur.id,
          transfertId,
          body.motifRejet
        );
        break;
      case "recuperer":
        resultat = await recupererTransfertEglise(session.utilisateur.id, transfertId);
        break;
    }

    return NextResponse.json({
      message:
        action === "confirmer"
          ? "Transfert confirmé — patient visible en destination."
          : action === "rejeter"
            ? "Transfert rejeté."
            : "Transfert récupéré.",
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/eglise/transferts/[id]/actions]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Action impossible.",
      },
      { status: 400 }
    );
  }
}
