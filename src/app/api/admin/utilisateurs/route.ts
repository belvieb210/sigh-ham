import { NextRequest, NextResponse } from "next/server";
import type { StatutUtilisateur } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  creerUtilisateurAdmin,
  listerUtilisateursAdmin,
} from "@/lib/admin/utilisateurs";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const sp = request.nextUrl.searchParams;
    const utilisateurs = await listerUtilisateursAdmin({
      q: sp.get("q") ?? undefined,
      roleId: sp.get("roleId") ?? undefined,
      statut: (sp.get("statut") as StatutUtilisateur | null) ?? undefined,
      limite: 200,
    });
    return NextResponse.json({ utilisateurs });
  } catch (error) {
    console.error("[GET /api/admin/utilisateurs]", error);
    return NextResponse.json(
      { message: "Impossible de charger les utilisateurs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const cree = await creerUtilisateurAdmin(
      { id: session.utilisateur.id, role: session.utilisateur.role },
      {
        identifiant: String(body.identifiant ?? ""),
        email: body.email != null ? String(body.email) : undefined,
        prenom: String(body.prenom ?? ""),
        nom: String(body.nom ?? ""),
        telephone: body.telephone != null ? String(body.telephone) : undefined,
        roleId: String(body.roleId ?? ""),
        motDePasse: String(body.motDePasse ?? ""),
        statut: (body.statut as StatutUtilisateur | undefined) ?? "ACTIF",
        notesAdmin: body.notesAdmin != null ? String(body.notesAdmin) : undefined,
      }
    );
    return NextResponse.json({
      message: "Utilisateur créé.",
      utilisateur: cree,
    });
  } catch (error) {
    console.error("[POST /api/admin/utilisateurs]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Création impossible.",
      },
      { status: 400 }
    );
  }
}
