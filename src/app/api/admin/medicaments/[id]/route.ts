import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  extraireFicheMedicament,
  messageErreurCatalogue,
  mettreAJourMedicament,
} from "@/lib/admin/catalogues";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const medicament = await mettreAJourMedicament(id, {
      code: body.code != null ? String(body.code) : undefined,
      nom: body.nom != null ? String(body.nom) : undefined,
      categorie:
        body.categorie !== undefined
          ? body.categorie == null
            ? null
            : String(body.categorie)
          : undefined,
      forme:
        body.forme !== undefined
          ? body.forme == null
            ? null
            : String(body.forme)
          : undefined,
      dosage:
        body.dosage !== undefined
          ? body.dosage == null
            ? null
            : String(body.dosage)
          : undefined,
      prixAchat:
        body.prixAchat !== undefined
          ? body.prixAchat === null || body.prixAchat === ""
            ? null
            : Number(body.prixAchat)
          : undefined,
      prixUnitaire:
        body.prixUnitaire != null ? Number(body.prixUnitaire) : undefined,
      stockMinimum:
        body.stockMinimum != null ? Number(body.stockMinimum) : undefined,
      emplacement:
        body.emplacement !== undefined
          ? body.emplacement == null
            ? null
            : String(body.emplacement)
          : undefined,
      actif: body.actif != null ? Boolean(body.actif) : undefined,
      ...extraireFicheMedicament(body),
    });
    return NextResponse.json({ message: "Médicament mis à jour.", medicament });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurCatalogue(code);
    if (msg) {
      return NextResponse.json(
        { message: msg },
        { status: code === "INTROUVABLE" ? 404 : 400 }
      );
    }
    console.error("[PATCH /api/admin/medicaments/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de mettre à jour le médicament." },
      { status: 500 }
    );
  }
}
