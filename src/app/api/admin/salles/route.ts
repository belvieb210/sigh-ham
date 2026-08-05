import { NextRequest, NextResponse } from "next/server";
import type { CodeSalle } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import { listerSallesAdmin, mettreAJourSalleAdmin } from "@/lib/admin/roles";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const toutes = request.nextUrl.searchParams.get("toutes") !== "0";
    const salles = await listerSallesAdmin({ toutes });
    return NextResponse.json({ salles });
  } catch (error) {
    console.error("[GET /api/admin/salles]", error);
    return NextResponse.json(
      { message: "Impossible de charger les services." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.services.write");
    const body = (await request.json()) as {
      code?: string;
      actif?: boolean;
      ordre?: number;
      nom?: string;
      description?: string | null;
    };
    if (!body.code) {
      return NextResponse.json({ message: "code requis." }, { status: 400 });
    }
    const salle = await mettreAJourSalleAdmin(
      { id: session.utilisateur.id },
      body.code as CodeSalle,
      {
        actif: body.actif,
        ordre: body.ordre,
        nom: body.nom,
        description: body.description,
      }
    );
    return NextResponse.json({ message: "Service mis à jour.", salle });
  } catch (error) {
    console.error("[PATCH /api/admin/salles]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Mise à jour impossible.",
      },
      { status: 400 }
    );
  }
}
