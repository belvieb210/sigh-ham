import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import {
  listerPatientsLaboratoire,
  listerPatientsStatutPersistantLaboratoire,
} from "@/lib/laboratoire/lister-patients-laboratoire";
import { listerTransfertsSortantsLaboratoire } from "@/lib/laboratoire/lister-transferts-sortants";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";

const VUES_STATUT_PERSISTANT: Record<
  string,
  Extract<IdOrientationStatutAnalyse, "VERIFIES" | "DR_APPROUVE" | "REJETES">
> = {
  verifies: "VERIFIES",
  "dr-approuve": "DR_APPROUVE",
  rejetes: "REJETES",
};

/**
 * GET /api/laboratoire/patients
 * ?vue=file (défaut) — patients en file labo (entrants confirmés)
 * ?vue=sortants — transferts émis depuis le laboratoire
 * ?vue=verifies | rejetes | dr-approuve — listes persistantes hors file
 */
export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const vue = request.nextUrl.searchParams.get("vue") ?? "file";
    const numeroPermanent =
      request.nextUrl.searchParams.get("numeroPermanent")?.trim() || "";
    const numeroPat = request.nextUrl.searchParams.get("numeroPat")?.trim() || "";
    const recherche =
      numeroPermanent || numeroPat
        ? { numeroPermanent, numeroPat }
        : undefined;
    const statutPersistant = VUES_STATUT_PERSISTANT[vue];
    const patients =
      vue === "sortants"
        ? await listerTransfertsSortantsLaboratoire()
        : statutPersistant
          ? await listerPatientsStatutPersistantLaboratoire(
              statutPersistant,
              recherche
            )
          : await listerPatientsLaboratoire(recherche);
    return NextResponse.json({ patients, vue });
  } catch (e) {
    console.error("[api/laboratoire/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les patients laboratoire." },
      { status: 500 }
    );
  }
}
