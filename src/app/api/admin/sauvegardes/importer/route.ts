import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import { importerSauvegarde } from "@/lib/admin/sauvegardes";

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
    const formData = await request.formData();
    const entree = formData.get("fichier");
    const fichier = entree instanceof File && entree.size > 0 ? entree : null;
    if (!fichier) {
      return NextResponse.json({ message: "Aucun fichier fourni." }, { status: 400 });
    }
    const resultat = await importerSauvegarde(session.utilisateur.id, fichier);
    return NextResponse.json({
      message: "Fichier importé. Vous pouvez le restaurer dans la base.",
      fichier: resultat.nom,
    });
  } catch (error) {
    console.error("[POST /api/admin/sauvegardes/importer]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Import impossible.",
      },
      { status: 400 }
    );
  }
}
