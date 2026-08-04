import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import {
  confirmerTransfertMedecinsExternes,
  rejeterTransfertMedecinsExternes,
  restaurerTransfertMedecinsExternes,
} from "@/lib/medecins-externes/gestion-transfert";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";

type Action = "confirmer" | "rejeter" | "restaurer";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { action?: Action; motifRejet?: string };
    if (!body.action || !["confirmer", "rejeter", "restaurer"].includes(body.action)) {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    let resultat;
    if (body.action === "confirmer") {
      resultat = await confirmerTransfertMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        id
      );
    } else if (body.action === "rejeter") {
      resultat = await rejeterTransfertMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        id,
        body.motifRejet
      );
    } else {
      resultat = await restaurerTransfertMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        id
      );
    }
    return NextResponse.json({ message: "OK", ...resultat });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Action impossible." },
      { status: 400 }
    );
  }
}
