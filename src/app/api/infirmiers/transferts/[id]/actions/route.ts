import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  confirmerTransfertInfirmiers,
  rejeterTransfertInfirmiers,
  restaurerTransfertInfirmiers,
} from "@/lib/infirmiers/gestion-transfert-infirmiers";

type ActionTransfert = "confirmer" | "rejeter" | "restaurer";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiInfirmiers();
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

    if (!action || !["confirmer", "rejeter", "restaurer"].includes(action)) {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }

    let resultat;
    switch (action) {
      case "confirmer":
        resultat = await confirmerTransfertInfirmiers(
          session.utilisateur.id,
          transfertId
        );
        break;
      case "rejeter":
        resultat = await rejeterTransfertInfirmiers(
          session.utilisateur.id,
          transfertId,
          body.motifRejet
        );
        break;
      case "restaurer":
        resultat = await restaurerTransfertInfirmiers(
          session.utilisateur.id,
          transfertId
        );
        break;
    }

    const messages: Record<ActionTransfert, string> = {
      confirmer:
        "Transfert confirmé — le patient est visible dans la salle de destination.",
      rejeter: "Transfert rejeté — vous pourrez le restaurer via le menu d'actions.",
      restaurer: "Transfert restauré — vous pouvez le confirmer à nouveau.",
    };

    return NextResponse.json({
      message: messages[action],
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/infirmiers/transferts/[id]/actions]", error);
    let message =
      error instanceof Error
        ? error.message
        : "Action impossible sur ce transfert.";
    if (message.startsWith("Invalid `prisma.")) {
      message =
        "Action impossible sur ce transfert. Rafraîchissez la page et réessayez.";
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
