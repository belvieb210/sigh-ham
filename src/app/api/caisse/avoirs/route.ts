import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { genererRapportAvoirs, type FiltresAvoirsCaisse } from "@/lib/caisse/avoirs";
import type { TypeMouvementAvoir } from "@/lib/caisse/types";

const TYPES = new Set<TypeMouvementAvoir>(["AVANCE", "SOLDE", "OUVERT"]);

export async function GET(request: Request) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const typeRaw = searchParams.get("type") ?? "";
    const type =
      typeRaw && TYPES.has(typeRaw as TypeMouvementAvoir)
        ? (typeRaw as TypeMouvementAvoir)
        : undefined;

    const filtres: FiltresAvoirsCaisse = {
      dateDu: searchParams.get("dateDu") ?? undefined,
      dateAu: searchParams.get("dateAu") ?? undefined,
      type,
      caissierId: searchParams.get("caissierId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    };

    const rapport = await genererRapportAvoirs(filtres);
    return NextResponse.json({ rapport });
  } catch (e) {
    console.error("[api/caisse/avoirs GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les avoirs / avances." },
      { status: 500 }
    );
  }
}
