import { NextRequest, NextResponse } from "next/server";
import type { StatutUtilisateur } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  mettreAJourUtilisateurAdmin,
  obtenirUtilisateurAdmin,
} from "@/lib/admin/utilisateurs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  const utilisateur = await obtenirUtilisateurAdmin(id);
  if (!utilisateur) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }
  return NextResponse.json({ utilisateur });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const maj = await mettreAJourUtilisateurAdmin(
      { id: session.utilisateur.id, role: session.utilisateur.role },
      id,
      {
        email: body.email === undefined ? undefined : (body.email as string | null),
        prenom: body.prenom != null ? String(body.prenom) : undefined,
        nom: body.nom != null ? String(body.nom) : undefined,
        telephone:
          body.telephone === undefined
            ? undefined
            : (body.telephone as string | null),
        roleId: body.roleId != null ? String(body.roleId) : undefined,
        statut: body.statut as StatutUtilisateur | undefined,
        motDePasse:
          body.motDePasse != null && String(body.motDePasse).length > 0
            ? String(body.motDePasse)
            : undefined,
      }
    );
    return NextResponse.json({
      message: "Utilisateur mis a jour.",
      utilisateur: maj,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/utilisateurs/:id]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Modification impossible.",
      },
      { status: 400 }
    );
  }
}
