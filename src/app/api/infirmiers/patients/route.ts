import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  listerPatientsConsultationInfirmiers,
  listerPatientsFicheTraitementInfirmiers,
  listerPatientsInfirmiers,
} from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET(req: Request) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const contexte = searchParams.get("contexte");
    const patients =
      contexte === "consultation"
        ? await listerPatientsConsultationInfirmiers()
        : contexte === "fiche-traitement"
          ? await listerPatientsFicheTraitementInfirmiers()
          : await listerPatientsInfirmiers();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/infirmiers/patients]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger la file." },
      { status: 500 }
    );
  }
}
