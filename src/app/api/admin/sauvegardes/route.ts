import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import {
  archiverSauvegarde,
  declencherSauvegarde,
  lireFichierSauvegarde,
  listerSauvegardes,
  supprimerSauvegarde,
} from "@/lib/admin/sauvegardes";

async function exigerSuperAdmin() {
  const session = await obtenirSessionApiAdmin();
  if (!session) return { session: null, refus: reponseNonAutoriseAdmin() };
  if (session.utilisateur.role.code !== "SUPER_ADMIN") {
    return {
      session: null,
      refus: NextResponse.json(
        { message: "Réservé au super administrateur." },
        { status: 403 }
      ),
    };
  }
  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.backup.run");
  } catch (error) {
    return {
      session: null,
      refus: NextResponse.json(
        {
          message:
            error instanceof Error ? error.message : "Permission insuffisante.",
        },
        { status: 403 }
      ),
    };
  }
  return { session, refus: null };
}

export async function GET(request: NextRequest) {
  const { session, refus } = await exigerSuperAdmin();
  if (!session) return refus;

  try {
    const fichier = request.nextUrl.searchParams.get("fichier");
    if (fichier) {
      const { chemin, nom } = await lireFichierSauvegarde(fichier);
      const buffer = await readFile(chemin);
      const gz = nom.endsWith(".gz");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": gz ? "application/gzip" : "application/sql",
          "Content-Disposition": `attachment; filename="${nom}"`,
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
  const { session, refus } = await exigerSuperAdmin();
  if (!session) return refus;

  try {
    const resultat = await declencherSauvegarde(session.utilisateur.id);
    return NextResponse.json({
      message: "Sauvegarde créée.",
      fichier: resultat.nom,
      nomBase: resultat.nomBase,
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

export async function PATCH(request: NextRequest) {
  const { session, refus } = await exigerSuperAdmin();
  if (!session) return refus;

  try {
    const body = (await request.json()) as { fichier?: string; archivee?: boolean };
    if (!body.fichier || typeof body.archivee !== "boolean") {
      return NextResponse.json({ message: "fichier et archivee requis." }, { status: 400 });
    }
    const resultat = await archiverSauvegarde(
      session.utilisateur.id,
      body.fichier,
      body.archivee
    );
    return NextResponse.json({
      message: resultat.archivee ? "Sauvegarde archivée." : "Sauvegarde désarchivée.",
      fichier: resultat.nom,
      archivee: resultat.archivee,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/sauvegardes]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Action impossible.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { session, refus } = await exigerSuperAdmin();
  if (!session) return refus;

  try {
    const fichier = request.nextUrl.searchParams.get("fichier");
    if (!fichier) {
      return NextResponse.json({ message: "fichier requis." }, { status: 400 });
    }
    await supprimerSauvegarde(session.utilisateur.id, fichier);
    return NextResponse.json({ message: "Sauvegarde supprimée.", fichier });
  } catch (error) {
    console.error("[DELETE /api/admin/sauvegardes]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Suppression impossible.",
      },
      { status: 400 }
    );
  }
}
