import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { EVENEMENT_MEDECINS_EXTERNES_MODIFIE } from "@/constants/medecins-externes";

export async function POST(request: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      orientations?: string[];
      orientation?: string;
    };
    if (!corps.dossierId) {
      return NextResponse.json({ message: "dossierId requis." }, { status: 400 });
    }
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const orientations =
      corps.orientations ??
      (corps.orientation ? [corps.orientation] : ["CAISSE"]);
    const resultat = await reorienterPatientDepuisMedecinsExternes(
      session.utilisateur.id,
      medecinExterneId,
      corps.dossierId,
      orientations
    );
    return NextResponse.json({
      message: "Orientation enregistrée.",
      evenement: EVENEMENT_MEDECINS_EXTERNES_MODIFIE,
      ...resultat,
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
