import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { modifierDestinationTransfertReception } from "@/lib/reception/gestion-transfert-reception";
import { ORIENTATIONS_TRANSFERT_RAPIDE } from "@/lib/reception/transferer-patient-accueil";
import type { CodeSalle } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ transfertId: string }> }
) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { transfertId } = await context.params;
    const body = (await request.json()) as { orientation?: string };
    const orientation = body.orientation?.trim();

    if (!orientation) {
      return NextResponse.json({ message: "Salle de destination requise." }, { status: 400 });
    }

    if (!ORIENTATIONS_TRANSFERT_RAPIDE.includes(orientation as CodeSalle)) {
      return NextResponse.json({ message: "Salle de destination invalide." }, { status: 400 });
    }

    const resultat = await modifierDestinationTransfertReception(transfertId, orientation);

    return NextResponse.json({
      message: `Destination mise à jour : ${resultat.salleDestination}.`,
      ...resultat,
    });
  } catch (error) {
    console.error("[PATCH /api/reception/transferts/[transfertId]]", error);
    const message =
      error instanceof Error ? error.message : "Impossible de modifier la destination.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
