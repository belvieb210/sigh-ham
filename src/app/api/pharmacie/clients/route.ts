import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiPharmacie } from "@/lib/auth/garde-api-pharmacie";
import { creerClientPharmacie } from "@/lib/pharmacie/creer-client";
import { listerClientsEnregistresPharmacie } from "@/lib/pharmacie/lister-clients-enregistres-pharmacie";
import { listerClientsVentePharmacie } from "@/lib/pharmacie/lister-clients-vente-pharmacie";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  try {
    const contexte = request.nextUrl.searchParams.get("contexte");
    if (contexte === "enregistres") {
      const clients = await listerClientsEnregistresPharmacie();
      return NextResponse.json({ clients });
    }
    const clients = await listerClientsVentePharmacie();
    return NextResponse.json({ clients });
  } catch (e) {
    console.error("[api/pharmacie/clients GET]", e);
    return NextResponse.json({ erreur: "Impossible de charger les clients." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await obtenirSessionApiPharmacie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  try {
    const corps = (await request.json()) as {
      prenom?: string;
      nom?: string;
      telephone?: string;
      adresse?: string;
      age?: number | string | null;
      sexe?: string;
    };
    const ageBrut = corps.age;
    const age =
      ageBrut === "" || ageBrut == null
        ? null
        : Number.parseInt(String(ageBrut), 10);
    const r = await creerClientPharmacie({
      prenom: corps.prenom ?? "",
      nom: corps.nom ?? "",
      telephone: corps.telephone,
      adresse: corps.adresse,
      age: Number.isFinite(age) ? age : null,
      sexe: corps.sexe,
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
