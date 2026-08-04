import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  mettreAJourConstantesVitales,
  normaliserDonneesConstantes,
  supprimerConstantesVitales,
} from "@/lib/infirmiers/gestion-constantes";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const corps = (await request.json()) as Record<string, unknown>;
    const constante = await mettreAJourConstantesVitales(
      id,
      normaliserDonneesConstantes(corps)
    );
    return NextResponse.json({ message: "Mesure mise à jour.", constante });
  } catch (e) {
    console.error("[PATCH /api/infirmiers/constantes/[id]]", e);
    const message =
      e instanceof Error ? e.message : "Impossible de mettre à jour.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await supprimerConstantesVitales(id);
    return NextResponse.json({ message: "Mesure supprimée.", id });
  } catch (e) {
    console.error("[DELETE /api/infirmiers/constantes/[id]]", e);
    const message =
      e instanceof Error ? e.message : "Impossible de supprimer.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
