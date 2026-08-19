import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const medecin = await prisma.medecinVitrine.update({
      where: { id },
      data: {
        ...(body.nom != null ? { nom: String(body.nom).trim() } : {}),
        ...(body.prenom != null ? { prenom: String(body.prenom).trim() } : {}),
        ...(body.specialite != null
          ? { specialite: String(body.specialite).trim() }
          : {}),
        ...(body.bio !== undefined
          ? { bio: body.bio ? String(body.bio) : null }
          : {}),
        ...(body.photoUrl !== undefined
          ? { photoUrl: body.photoUrl ? String(body.photoUrl) : null }
          : {}),
        ...(body.horaires !== undefined
          ? { horaires: body.horaires ? String(body.horaires) : null }
          : {}),
        ...(body.telephone !== undefined
          ? { telephone: body.telephone ? String(body.telephone) : null }
          : {}),
        ...(body.email !== undefined
          ? { email: body.email ? String(body.email) : null }
          : {}),
        ...(body.salleId !== undefined
          ? { salleId: body.salleId ? String(body.salleId) : null }
          : {}),
        ...(body.categorie != null
          ? {
              categorie: [
                "MEDECIN",
                "PERSONNEL",
                "RESPONSABLE_LABO",
                "MEDECIN_EXTERNE",
                "SERVICE_EGLISE",
              ].includes(String(body.categorie).toUpperCase())
                ? String(body.categorie).toUpperCase()
                : "MEDECIN",
            }
          : {}),
        ...(body.masquerContactsPublic !== undefined
          ? { masquerContactsPublic: Boolean(body.masquerContactsPublic) }
          : {}),
        ...(body.badgeValeur1 !== undefined
          ? { badgeValeur1: body.badgeValeur1 ? String(body.badgeValeur1) : null }
          : {}),
        ...(body.badgeLibelle1 !== undefined
          ? { badgeLibelle1: body.badgeLibelle1 ? String(body.badgeLibelle1) : null }
          : {}),
        ...(body.badgeValeur2 !== undefined
          ? { badgeValeur2: body.badgeValeur2 ? String(body.badgeValeur2) : null }
          : {}),
        ...(body.badgeLibelle2 !== undefined
          ? { badgeLibelle2: body.badgeLibelle2 ? String(body.badgeLibelle2) : null }
          : {}),
        ...(body.badgeValeur3 !== undefined
          ? { badgeValeur3: body.badgeValeur3 ? String(body.badgeValeur3) : null }
          : {}),
        ...(body.badgeLibelle3 !== undefined
          ? { badgeLibelle3: body.badgeLibelle3 ? String(body.badgeLibelle3) : null }
          : {}),
        ...(body.ordre != null ? { ordre: Number(body.ordre) } : {}),
        ...(body.actif != null ? { actif: Boolean(body.actif) } : {}),
      },
    });
    return NextResponse.json({ medecin });
  } catch (error) {
    console.error("[PUT /api/client/medecins-vitrine/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    await prisma.medecinVitrine.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/medecins-vitrine/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
