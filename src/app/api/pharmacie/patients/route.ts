import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { listerPatientsPharmacie } from "@/lib/pharmacie/lister-patients-pharmacie";

export async function GET() {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const patients = await listerPatientsPharmacie();
    return NextResponse.json({ patients });
  } catch (e) {
    console.error("[api/pharmacie/patients]", e);
    return NextResponse.json({ erreur: "Impossible de charger la file." }, { status: 500 });
  }
}
