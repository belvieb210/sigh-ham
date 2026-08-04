import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { reorienterPatientDepuisPharmacie } from "@/lib/pharmacie/reorienter-patient-pharmacie";

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const corps = (await request.json()) as {
      dossierId?: string;
      orientation?: string;
      orientations?: string[];
    };
    const orientations =
      corps.orientations?.filter(Boolean) ??
      (corps.orientation?.trim() ? [corps.orientation.trim()] : []);
    if (!corps.dossierId?.trim() || orientations.length === 0) {
      return NextResponse.json(
        { message: "dossierId et orientation(s) requis." },
        { status: 400 }
      );
    }
    const resultat = await reorienterPatientDepuisPharmacie(
      session.utilisateur.id,
      corps.dossierId.trim(),
      orientations
    );
    return NextResponse.json({
      message: `Transfert(s) vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
      ...resultat,
    });
  } catch (e) {
    console.error("[POST /api/pharmacie/transferts]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur orientation." },
      { status: 400 }
    );
  }
}
