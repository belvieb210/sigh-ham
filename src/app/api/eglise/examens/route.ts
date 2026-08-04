import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { rechercherTypesExamen } from "@/lib/reception/rechercher-types-examen";
import { listerTypesExamenPackPrenuptial } from "@/lib/eglise/pack-prenuptial";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    if (request.nextUrl.searchParams.get("pack") === "prenuptial") {
      const examens = await listerTypesExamenPackPrenuptial();
      return NextResponse.json({
        examens: examens.map((e) => ({
          id: e.id,
          code: e.code,
          libelle: e.libelle,
          categorie: e.categorie,
          prix: Number(e.prix),
        })),
      });
    }

    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : 12;
    const examens = await rechercherTypesExamen(
      q,
      limite > 0 && limite <= 50 ? limite : 12
    );
    return NextResponse.json({ examens });
  } catch (error) {
    console.error("[GET /api/eglise/examens]", error);
    return NextResponse.json(
      { message: "Impossible de charger les examens." },
      { status: 500 }
    );
  }
}
