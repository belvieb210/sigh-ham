import { NextResponse } from "next/server";
import type { ModePaiement } from "@/generated/prisma/client";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { genererRapportCaisse } from "@/lib/caisse/rapports";
import type { FiltresRapportCaisse, PeriodeRapportCaisse } from "@/lib/caisse/types";

const MODES_VALIDES = new Set<ModePaiement>([
  "ESPECES",
  "MOBILE_MONEY",
  "CARTE",
  "VIREMENT",
  "CHEQUE",
]);

function parserPeriode(raw: string | null): PeriodeRapportCaisse {
  if (raw === "mensuel") return "mensuel";
  if (raw === "plage") return "plage";
  return "journalier";
}

export async function GET(request: Request) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const periode = parserPeriode(searchParams.get("periode"));
    const modeRaw = searchParams.get("mode") ?? "";
    const mode =
      modeRaw && MODES_VALIDES.has(modeRaw as ModePaiement)
        ? (modeRaw as ModePaiement)
        : undefined;

    const filtres: FiltresRapportCaisse = {
      periode,
      date: searchParams.get("date") ?? undefined,
      mois: searchParams.get("mois") ?? undefined,
      dateDu: searchParams.get("dateDu") ?? undefined,
      dateAu: searchParams.get("dateAu") ?? undefined,
      mode,
      caissierId: searchParams.get("caissierId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    };

    const rapport = await genererRapportCaisse(filtres);
    return NextResponse.json({ rapport });
  } catch (e) {
    console.error("[api/caisse/rapports GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger le rapport de caisse." },
      { status: 500 }
    );
  }
}
