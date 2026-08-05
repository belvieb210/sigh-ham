import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { assertPermissionAdmin } from "@/lib/admin/permissions";
import {
  listerParametres,
  upsertParametres,
} from "@/lib/admin/parametres";
import { enregistrerAudit } from "@/lib/admin/audit";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const categorie = request.nextUrl.searchParams.get("categorie") ?? undefined;
    const parametres = await listerParametres(categorie);
    return NextResponse.json({ parametres });
  } catch (error) {
    console.error("[GET /api/admin/parametres]", error);
    return NextResponse.json(
      { message: "Impossible de charger les parametres." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    await assertPermissionAdmin(session.utilisateur.id, "admin.params.write");
    const body = (await request.json()) as {
      parametres?: { cle: string; valeur: string; categorie?: string; description?: string }[];
    };
    if (!body.parametres?.length) {
      return NextResponse.json(
        { message: "Aucun parametre a enregistrer." },
        { status: 400 }
      );
    }

    const parametres = await upsertParametres(
      body.parametres,
      session.utilisateur.id
    );

    await enregistrerAudit({
      utilisateurId: session.utilisateur.id,
      type: "MODIFICATION",
      entite: "ParametreSysteme",
      action: `Mise a jour de ${parametres.length} parametre(s)`,
      details: { cles: parametres.map((p) => p.cle) },
    });

    return NextResponse.json({
      message: "Parametres enregistres.",
      parametres,
    });
  } catch (error) {
    console.error("[PUT /api/admin/parametres]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Enregistrement impossible.",
      },
      { status: 400 }
    );
  }
}
