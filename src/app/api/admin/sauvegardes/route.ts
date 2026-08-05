import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import {
  cheminSauvegarde,
  declencherSauvegarde,
  listerSauvegardes,
} from "@/lib/admin/sauvegardes";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.backup.run");
    const fichier = request.nextUrl.searchParams.get("fichier");
    if (fichier) {
      const chemin = cheminSauvegarde(fichier);
      const buffer = await readFile(chemin);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/sql",
          "Content-Disposition": `attachment; filename="${fichier}"`,
        },
      });
    }
    const sauvegardes = await listerSauvegardes();
    return NextResponse.json({ sauvegardes });
  } catch (error) {
    console.error("[GET /api/admin/sauvegardes]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible de lister les sauvegardes.",
      },
      { status: 400 }
    );
  }
}

export async function POST() {
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
    const resultat = await declencherSauvegarde(session.utilisateur.id);
    return NextResponse.json({
      message: "Sauvegarde créée.",
      fichier: resultat.nom,
    });
  } catch (error) {
    console.error("[POST /api/admin/sauvegardes]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Échec de la sauvegarde (pg_dump disponible ?).",
      },
      { status: 500 }
    );
  }
}
