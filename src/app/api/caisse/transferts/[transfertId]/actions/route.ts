import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import {
  confirmerTransfertCaisse,
  recupererTransfertCaisse,
  rejeterTransfertCaisse,
} from "@/lib/caisse/gestion-transfert-caisse";
import {
  confirmerTransfertEntrantCaisse,
  recupererTransfertEntrantCaisse,
  rejeterTransfertEntrantCaisse,
} from "@/lib/caisse/gestion-transfert-entrant-caisse";
import { prisma } from "@/lib/prisma";

type ActionTransfert = "confirmer" | "rejeter" | "recuperer";

async function determinerSensTransfert(transfertId: string) {
  const transfert = await prisma.transfert.findUnique({
    where: { id: transfertId },
    include: {
      salleOrigine: { select: { code: true } },
      salleDestination: { select: { code: true } },
    },
  });

  if (!transfert) {
    throw new Error("Transfert introuvable.");
  }

  if (transfert.salleDestination.code === "CAISSE") return "entrant" as const;
  if (transfert.salleOrigine.code === "CAISSE") return "sortant" as const;

  throw new Error("Ce transfert ne peut pas être géré depuis la caisse.");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ transfertId: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { transfertId } = await context.params;
    const body = (await request.json()) as { action?: ActionTransfert; motifRejet?: string };
    const action = body.action;

    if (!action || !["confirmer", "rejeter", "recuperer"].includes(action)) {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }

    const sens = await determinerSensTransfert(transfertId);
    let resultat;

    if (sens === "entrant") {
      switch (action) {
        case "confirmer":
          resultat = await confirmerTransfertEntrantCaisse(session.utilisateur.id, transfertId);
          break;
        case "rejeter":
          resultat = await rejeterTransfertEntrantCaisse(
            session.utilisateur.id,
            transfertId,
            body.motifRejet
          );
          break;
        case "recuperer":
          resultat = await recupererTransfertEntrantCaisse(session.utilisateur.id, transfertId);
          break;
      }
    } else {
      switch (action) {
        case "confirmer":
          resultat = await confirmerTransfertCaisse(session.utilisateur.id, transfertId);
          break;
        case "rejeter":
          resultat = await rejeterTransfertCaisse(
            session.utilisateur.id,
            transfertId,
            body.motifRejet
          );
          break;
        case "recuperer":
          resultat = await recupererTransfertCaisse(session.utilisateur.id, transfertId);
          break;
      }
    }

    const messages: Record<ActionTransfert, string> = {
      confirmer: "Transfert confirmé — le patient est visible dans la salle de destination.",
      rejeter: "Transfert rejeté — vous pourrez le restaurer via le menu d'actions.",
      recuperer: "Transfert restauré — vous pouvez le confirmer à nouveau.",
    };

    return NextResponse.json({
      message: messages[action],
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/caisse/transferts/[transfertId]/actions]", error);
    let message =
      error instanceof Error ? error.message : "Action impossible sur ce transfert.";
    if (message.startsWith("Invalid `prisma.")) {
      message = "Action impossible sur ce transfert. Rafraîchissez la page et réessayez.";
    }
    return NextResponse.json({ message }, { status: 400 });
  }
}
