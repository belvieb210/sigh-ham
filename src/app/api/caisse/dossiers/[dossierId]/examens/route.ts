import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import {
  ajouterExamenAuDossierCaisse,
  ajouterPaquetBilanAuDossierCaisse,
  retirerLigneFacturationCaisse,
} from "@/lib/caisse/facturation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { dossierId } = await context.params;
    const body = (await request.json()) as {
      typeExamenId?: string;
      paquetBilanId?: string;
    };
    const typeExamenId = body.typeExamenId?.trim();
    const paquetBilanId = body.paquetBilanId?.trim();

    if (typeExamenId && paquetBilanId) {
      return NextResponse.json(
        { message: "Un seul type d'ajout à la fois (examen ou paquet)." },
        { status: 400 }
      );
    }

    if (paquetBilanId) {
      const dossier = await ajouterPaquetBilanAuDossierCaisse(
        dossierId,
        paquetBilanId,
        session.utilisateur.id
      );
      return NextResponse.json({
        message: "Paquet bilan ajouté à la facturation.",
        dossier,
      });
    }

    if (!typeExamenId) {
      return NextResponse.json({ message: "Examen ou paquet requis." }, { status: 400 });
    }

    const dossier = await ajouterExamenAuDossierCaisse(
      dossierId,
      typeExamenId,
      session.utilisateur.id
    );

    return NextResponse.json({
      message: "Examen ajouté à la facturation.",
      dossier,
    });
  } catch (error) {
    console.error("[POST /api/caisse/dossiers/[dossierId]/examens]", error);
    const message =
      error instanceof Error ? error.message : "Impossible d'ajouter l'examen.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { dossierId } = await context.params;
    const body = (await request.json()) as {
      ligneId?: string;
      source?: "EXAMEN" | "FACTURE";
    };
    const ligneId = body.ligneId?.trim();
    const source = body.source;

    if (!ligneId || (source !== "EXAMEN" && source !== "FACTURE")) {
      return NextResponse.json(
        { message: "Ligne et source requises." },
        { status: 400 }
      );
    }

    const dossier = await retirerLigneFacturationCaisse(dossierId, ligneId, source);

    return NextResponse.json({
      message: "Examen retiré de la facturation.",
      dossier,
    });
  } catch (error) {
    console.error("[DELETE /api/caisse/dossiers/[dossierId]/examens]", error);
    const message =
      error instanceof Error ? error.message : "Impossible de retirer l'examen.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
