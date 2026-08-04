import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { statsMedecinsExternesJour } from "@/lib/medecins-externes/lister-patients";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";

export async function GET() {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const stats = await statsMedecinsExternesJour(
      medecinExterneId,
      session.utilisateur.id
    );
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[api/medecins-externes/stats]", e);
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}
