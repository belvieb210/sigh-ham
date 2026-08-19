import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  "MEDECIN",
  "PERSONNEL",
  "RESPONSABLE_LABO",
  "MEDECIN_EXTERNE",
  "SERVICE_EGLISE",
] as const;

function normaliserCategorie(valeur: unknown) {
  const categorie = String(valeur ?? "MEDECIN").trim().toUpperCase();
  return (CATEGORIES as readonly string[]).includes(categorie)
    ? categorie
    : "MEDECIN";
}

function texteOptionnel(valeur: unknown) {
  const texte = String(valeur ?? "").trim();
  return texte || null;
}

export async function GET() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const [entrees, salles] = await Promise.all([
      prisma.medecinVitrine.findMany({
        include: {
          salle: {
            select: { id: true, code: true, nom: true },
          },
        },
        orderBy: [{ categorie: "asc" }, { ordre: "asc" }, { nom: "asc" }],
      }),
      prisma.salle.findMany({
        where: { actif: true },
        select: { id: true, code: true, nom: true, ordre: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      }),
    ]);

    return NextResponse.json({ entrees, salles });
  } catch (error) {
    console.error("[GET /api/admin/gouvernance]", error);
    return NextResponse.json(
      { message: "Impossible de charger la gouvernance." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const nom = String(body.nom ?? "").trim();
    const prenom = String(body.prenom ?? "").trim();
    const specialite = String(body.specialite ?? "").trim();

    if (!nom || !prenom || !specialite) {
      return NextResponse.json(
        { message: "Prénom, nom et fonction sont requis." },
        { status: 400 }
      );
    }

    const entree = await prisma.medecinVitrine.create({
      data: {
        nom,
        prenom,
        specialite,
        bio: texteOptionnel(body.bio),
        photoUrl: texteOptionnel(body.photoUrl),
        horaires: texteOptionnel(body.horaires),
        telephone: texteOptionnel(body.telephone),
        email: texteOptionnel(body.email),
        salleId: texteOptionnel(body.salleId),
        categorie: normaliserCategorie(body.categorie),
        masquerContactsPublic: Boolean(body.masquerContactsPublic),
        badgeValeur1: texteOptionnel(body.badgeValeur1),
        badgeLibelle1: texteOptionnel(body.badgeLibelle1),
        badgeValeur2: texteOptionnel(body.badgeValeur2),
        badgeLibelle2: texteOptionnel(body.badgeLibelle2),
        badgeValeur3: texteOptionnel(body.badgeValeur3),
        badgeLibelle3: texteOptionnel(body.badgeLibelle3),
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
      },
      include: {
        salle: {
          select: { id: true, code: true, nom: true },
        },
      },
    });

    return NextResponse.json({ entree }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/gouvernance]", error);
    return NextResponse.json(
      { message: "Impossible d'ajouter cette entrée." },
      { status: 500 }
    );
  }
}
