import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import { listerChambresLits } from "@/lib/medecins/gestion-admission";

export async function GET() {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const lits = await listerChambresLits();
    return NextResponse.json({ lits });
  } catch (e) {
    console.error("[api/medecins/lits]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les lits." },
      { status: 500 }
    );
  }
}
