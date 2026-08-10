import { NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import {
  listerPatientsHistoriqueInfirmiers,
  obtenirHistoriqueCompletDossierInfirmiers,
} from "@/lib/infirmiers/lister-patients-infirmiers";

export async function GET(req: Request) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim();

    if (dossierId) {
      const detail = await obtenirHistoriqueCompletDossierInfirmiers(dossierId);
      if (!detail) {
        return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
      }
      return NextResponse.json({ detail });
    }

    const patients = await listerPatientsHistoriqueInfirmiers();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/infirmiers/historique]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger l'historique." },
      { status: 500 }
    );
  }
}
