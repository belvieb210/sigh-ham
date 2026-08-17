import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import { restaurerSauvegarde } from "@/lib/admin/sauvegardes";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();
  if (session.utilisateur.role.code !== "SUPER_ADMIN") {
    return NextResponse.json(
      { message: "Réservé au super administrateur." },
      { status: 403 }
    );
  }

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.backup.run");
    const body = (await request.json()) as { fichier?: string };
    if (!body.fichier) {
      return NextResponse.json({ message: "fichier requis." }, { status: 400 });
    }
    await restaurerSauvegarde(session.utilisateur.id, body.fichier);
    return NextResponse.json({
      message: "Restauration terminée. La base contient désormais cette version.",
      fichier: body.fichier,
    });
  } catch (error) {
    console.error("[POST /api/admin/sauvegardes/restaurer]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Restauration impossible.",
      },
      { status: 400 }
    );
  }
}
