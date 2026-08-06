import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  "MEDECIN",
  "PERSONNEL",
  "RESPONSABLE_LABO",
  "MEDECIN_EXTERNE",
  "SERVICE_EGLISE",
] as const;

function normaliserCategorie(v: unknown): string {
  const c = String(v ?? "MEDECIN").trim().toUpperCase();
  return (CATEGORIES as readonly string[]).includes(c) ? c : "MEDECIN";
}

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const medecins = await prisma.medecinVitrine.findMany({
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
    return NextResponse.json({ medecins });
  } catch (error) {
    console.error("[GET /api/client/medecins-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nom = String(body.nom ?? "").trim();
    const prenom = String(body.prenom ?? "").trim();
    const specialite = String(body.specialite ?? "").trim();
    if (!nom || !prenom || !specialite) {
      return NextResponse.json(
        { message: "nom, prenom et specialite requis." },
        { status: 400 }
      );
    }
    const medecin = await prisma.medecinVitrine.create({
      data: {
        nom,
        prenom,
        specialite,
        bio: body.bio ? String(body.bio) : null,
        photoUrl: body.photoUrl ? String(body.photoUrl) : null,
        horaires: body.horaires ? String(body.horaires) : null,
        telephone: body.telephone ? String(body.telephone) : null,
        email: body.email ? String(body.email) : null,
        categorie: normaliserCategorie(body.categorie),
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
      },
    });
    return NextResponse.json({ medecin }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/medecins-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
