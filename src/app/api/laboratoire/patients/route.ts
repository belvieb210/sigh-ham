import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import {
  listerPatientsDrApprouveLaboratoire,
  listerPatientsLaboratoire,
} from "@/lib/laboratoire/lister-patients-laboratoire";
import { listerTransfertsSortantsLaboratoire } from "@/lib/laboratoire/lister-transferts-sortants";

/**
 * GET /api/laboratoire/patients
 * ?vue=file (défaut) — patients en file labo (entrants confirmés)
 * ?vue=sortants — transferts émis depuis le laboratoire
 * ?vue=dr-approuve — examens validés biologiste (persistants, hors file)
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
    const patients =
      vue === "sortants"
        ? await listerTransfertsSortantsLaboratoire()
        : vue === "dr-approuve"
          ? await listerPatientsDrApprouveLaboratoire(recherche)
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
