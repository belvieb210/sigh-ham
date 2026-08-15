import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { listerEstimationsPourCaisse } from "@/lib/eglise/estimations-convention";
import { listerEstimationsPharmacieClientPourCaisse } from "@/lib/caisse/estimations-pharmacie-client";

export async function GET() {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const [convention, pharmacieClient] = await Promise.all([
      listerEstimationsPourCaisse(),
      listerEstimationsPharmacieClientPourCaisse(),
    ]);
    const estimations = [...pharmacieClient, ...convention];
    const totaux = estimations.reduce(
      (acc, e) => ({
        totalPatients: acc.totalPatients + e.totalPatientUsd,
        honoraires: acc.honoraires + e.honoraireUsd,
        count: acc.count + 1,
      }),
      { totalPatients: 0, honoraires: 0, count: 0 }
    );
    return NextResponse.json({ estimations, totaux });
  } catch (error) {
    console.error("[GET /api/caisse/estimations]", error);
    return NextResponse.json(
      { message: "Impossible de charger les estimations." },
      { status: 500 }
    );
  }
}
