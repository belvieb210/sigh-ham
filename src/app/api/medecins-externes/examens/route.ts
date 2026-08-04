import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { rechercherTypesExamen } from "@/lib/reception/rechercher-types-examen";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : 12;

    const examens = await rechercherTypesExamen(
      q,
      limite > 0 && limite <= 50 ? limite : 12
    );

    return NextResponse.json({ examens });
  } catch (error) {
    console.error("[GET /api/medecins-externes/examens]", error);
    return NextResponse.json(
      { message: "Impossible de charger les examens." },
      { status: 500 }
    );
  }
}
