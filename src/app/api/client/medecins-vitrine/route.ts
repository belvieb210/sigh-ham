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
      include: {
        salle: {
          select: { id: true, code: true, nom: true },
        },
      },
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
        salleId: body.salleId ? String(body.salleId) : null,
        categorie: normaliserCategorie(body.categorie),
        masquerContactsPublic: body.masquerContactsPublic === true,
        badgeValeur1: body.badgeValeur1 ? String(body.badgeValeur1) : null,
        badgeLibelle1: body.badgeLibelle1 ? String(body.badgeLibelle1) : null,
        badgeValeur2: body.badgeValeur2 ? String(body.badgeValeur2) : null,
        badgeLibelle2: body.badgeLibelle2 ? String(body.badgeLibelle2) : null,
        badgeValeur3: body.badgeValeur3 ? String(body.badgeValeur3) : null,
        badgeLibelle3: body.badgeLibelle3 ? String(body.badgeLibelle3) : null,
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
