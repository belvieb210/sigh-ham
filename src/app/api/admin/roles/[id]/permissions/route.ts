import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  assertPermissionAdmin,
  definirPermissionsRole,
  obtenirPermissionsRole,
} from "@/lib/admin/permissions";
import { obtenirRoleAdmin } from "@/lib/admin/roles";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  try {
    const role = await obtenirRoleAdmin(id);
    if (!role) {
      return NextResponse.json({ message: "Rôle introuvable." }, { status: 404 });
    }
    const permissions = await obtenirPermissionsRole(id);
    return NextResponse.json({ role, permissions });
  } catch (error) {
    console.error("[GET /api/admin/roles/:id/permissions]", error);
    return NextResponse.json(
      { message: "Impossible de charger les permissions du rôle." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.roles.write");
    const body = (await request.json()) as { permissionIds?: string[] };
    const permissions = await definirPermissionsRole(
      { id: session.utilisateur.id, role: session.utilisateur.role },
      id,
      body.permissionIds ?? []
    );
    return NextResponse.json({
      message: "Permissions enregistrées.",
      permissions,
    });
  } catch (error) {
    console.error("[PUT /api/admin/roles/:id/permissions]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Mise à jour impossible.",
      },
      { status: 400 }
    );
  }
}
