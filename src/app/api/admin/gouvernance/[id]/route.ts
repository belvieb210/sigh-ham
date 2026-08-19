import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

const CATEGORIES = [
  "MEDECIN",
  "PERSONNEL",
  "RESPONSABLE_LABO",
  "MEDECIN_EXTERNE",
  "SERVICE_EGLISE",
] as const;

function texteOptionnel(valeur: unknown) {
  const texte = String(valeur ?? "").trim();
  return texte || null;
}

function normaliserCategorie(valeur: unknown) {
  const categorie = String(valeur ?? "MEDECIN").trim().toUpperCase();
  return (CATEGORIES as readonly string[]).includes(categorie)
    ? categorie
    : "MEDECIN";
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const entree = await prisma.medecinVitrine.update({
      where: { id },
      data: {
        ...(body.nom !== undefined ? { nom: String(body.nom).trim() } : {}),
        ...(body.prenom !== undefined ? { prenom: String(body.prenom).trim() } : {}),
        ...(body.specialite !== undefined
          ? { specialite: String(body.specialite).trim() }
          : {}),
        ...(body.bio !== undefined ? { bio: texteOptionnel(body.bio) } : {}),
        ...(body.photoUrl !== undefined
          ? { photoUrl: texteOptionnel(body.photoUrl) }
          : {}),
        ...(body.horaires !== undefined
          ? { horaires: texteOptionnel(body.horaires) }
          : {}),
        ...(body.telephone !== undefined
          ? { telephone: texteOptionnel(body.telephone) }
          : {}),
        ...(body.email !== undefined ? { email: texteOptionnel(body.email) } : {}),
        ...(body.salleId !== undefined ? { salleId: texteOptionnel(body.salleId) } : {}),
        ...(body.categorie !== undefined
          ? { categorie: normaliserCategorie(body.categorie) }
          : {}),
        ...(body.masquerContactsPublic !== undefined
          ? { masquerContactsPublic: Boolean(body.masquerContactsPublic) }
          : {}),
        ...(body.badgeValeur1 !== undefined
          ? { badgeValeur1: texteOptionnel(body.badgeValeur1) }
          : {}),
        ...(body.badgeLibelle1 !== undefined
          ? { badgeLibelle1: texteOptionnel(body.badgeLibelle1) }
          : {}),
        ...(body.badgeValeur2 !== undefined
          ? { badgeValeur2: texteOptionnel(body.badgeValeur2) }
          : {}),
        ...(body.badgeLibelle2 !== undefined
          ? { badgeLibelle2: texteOptionnel(body.badgeLibelle2) }
          : {}),
        ...(body.badgeValeur3 !== undefined
          ? { badgeValeur3: texteOptionnel(body.badgeValeur3) }
          : {}),
        ...(body.badgeLibelle3 !== undefined
          ? { badgeLibelle3: texteOptionnel(body.badgeLibelle3) }
          : {}),
        ...(body.ordre !== undefined ? { ordre: Number(body.ordre) } : {}),
        ...(body.actif !== undefined ? { actif: Boolean(body.actif) } : {}),
      },
      include: {
        salle: {
          select: { id: true, code: true, nom: true },
        },
      },
    });

    return NextResponse.json({ entree });
  } catch (error) {
    console.error("[PUT /api/admin/gouvernance/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de modifier cette entrée." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();
  const { id } = await ctx.params;

  try {
    await prisma.medecinVitrine.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/gouvernance/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de supprimer cette entrée." },
      { status: 500 }
    );
  }
}
