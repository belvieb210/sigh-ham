import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  messageErreurCatalogue,
  mettreAJourTypeExamen,
  supprimerTypeExamen,
} from "@/lib/admin/catalogues";
import { lireParametresBody } from "@/lib/admin/lire-parametres-examen";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const examen = await mettreAJourTypeExamen(id, {
      code: body.code != null ? String(body.code) : undefined,
      libelle: body.libelle != null ? String(body.libelle) : undefined,
      categorie: body.categorie != null ? String(body.categorie) : undefined,
      prix: body.prix != null ? Number(body.prix) : undefined,
      delaiHeures:
        body.delaiHeures != null ? Number(body.delaiHeures) : undefined,
      actif: body.actif != null ? Boolean(body.actif) : undefined,
      packPrenuptial:
        body.packPrenuptial != null ? Boolean(body.packPrenuptial) : undefined,
      formulaire:
        body.formulaire !== undefined
          ? body.formulaire == null
            ? null
            : String(body.formulaire)
          : undefined,
      serviceLabo:
        body.serviceLabo !== undefined
          ? body.serviceLabo == null
            ? null
            : String(body.serviceLabo)
          : undefined,
      specimen:
        body.specimen !== undefined
          ? body.specimen == null
            ? null
            : String(body.specimen)
          : undefined,
      uniteDefaut:
        body.uniteDefaut !== undefined
          ? body.uniteDefaut == null
            ? null
            : String(body.uniteDefaut)
          : undefined,
      rangeUsuelle:
        body.rangeUsuelle !== undefined
          ? body.rangeUsuelle == null
            ? null
            : String(body.rangeUsuelle)
          : undefined,
      description:
        body.description !== undefined
          ? body.description == null
            ? null
            : String(body.description)
          : undefined,
      parametres: Array.isArray(body.parametres)
        ? lireParametresBody(body.parametres)
        : undefined,
    });
    return NextResponse.json({ message: "Examen mis à jour.", examen });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurCatalogue(code);
    if (msg) {
      return NextResponse.json(
        { message: msg },
        { status: code === "INTROUVABLE" ? 404 : 400 }
      );
    }
    console.error("[PATCH /api/admin/examens/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de mettre à jour l'examen." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const { id } = await context.params;
    await supprimerTypeExamen(id);
    return NextResponse.json({ message: "Examen supprimé définitivement." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurCatalogue(code);
    if (msg) {
      return NextResponse.json(
        { message: msg },
        {
          status:
            code === "INTROUVABLE"
              ? 404
              : code === "EXAMEN_EN_USAGE"
                ? 409
                : 400,
        }
      );
    }
    console.error("[DELETE /api/admin/examens/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de supprimer l'examen." },
      { status: 500 }
    );
  }
}
