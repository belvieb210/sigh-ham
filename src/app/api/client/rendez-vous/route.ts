import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import {
  compterDemandesRdvParStatut,
  listerDemandesRdv,
} from "@/lib/rdv/gestion-demandes";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const statut = request.nextUrl.searchParams.get("statut") ?? undefined;
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const [demandes, compteurs] = await Promise.all([
      listerDemandesRdv({ statut, q }),
      compterDemandesRdvParStatut(),
    ]);
    return NextResponse.json({ demandes, compteurs });
  } catch (error) {
    console.error("[GET /api/client/rendez-vous]", error);
    return NextResponse.json(
      { message: "Impossible de charger les rendez-vous." },
      { status: 500 }
    );
  }
}
