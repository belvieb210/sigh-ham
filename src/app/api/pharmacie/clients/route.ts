import { NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { creerClientPharmacie } from "@/lib/pharmacie/creer-client";

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as {
      prenom?: string;
      nom?: string;
      telephone?: string;
      adresse?: string;
    };
    const r = await creerClientPharmacie({
      prenom: corps.prenom ?? "",
      nom: corps.nom ?? "",
      telephone: corps.telephone,
      adresse: corps.adresse,
    });
    return NextResponse.json({
      message: "Client enregistré.",
      dossierId: r.dossier.id,
      numeroDossier: r.dossier.numeroDossier,
      patient: r.patient,
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
