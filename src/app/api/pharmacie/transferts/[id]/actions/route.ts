import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import {
  confirmerTransfertPharmacie,
  rejeterTransfertPharmacie,
  restaurerTransfertPharmacie,
} from "@/lib/pharmacie/gestion-transfert-pharmacie";

type Action = "confirmer" | "rejeter" | "restaurer";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { action?: Action; motifRejet?: string };
    if (!body.action || !["confirmer", "rejeter", "restaurer"].includes(body.action)) {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }
    let resultat;
    if (body.action === "confirmer") {
      resultat = await confirmerTransfertPharmacie(session.utilisateur.id, id);
    } else if (body.action === "rejeter") {
      resultat = await rejeterTransfertPharmacie(
        session.utilisateur.id,
        id,
        body.motifRejet
      );
    } else {
      resultat = await restaurerTransfertPharmacie(session.utilisateur.id, id);
    }
    return NextResponse.json({ message: "OK", ...resultat });
  } catch (e) {
    console.error("[api/pharmacie/transferts/actions]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Action impossible." },
      { status: 400 }
    );
  }
}
