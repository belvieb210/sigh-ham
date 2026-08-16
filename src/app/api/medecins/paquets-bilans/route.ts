import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerPaquetsBilansActifs } from "@/lib/reception/lister-paquets-bilans-actifs";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const paquets = await listerPaquetsBilansActifs({ q });
    return NextResponse.json({ paquets });
  } catch (error) {
    console.error("[GET /api/medecins/paquets-bilans]", error);
    return NextResponse.json(
      { erreur: "Impossible de charger les paquets bilans." },
      { status: 500 }
    );
  }
}
