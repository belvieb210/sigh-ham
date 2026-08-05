import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  creerMedicament,
  listerMedicaments,
  messageErreurCatalogue,
} from "@/lib/admin/catalogues";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const sp = request.nextUrl.searchParams;
    const actifParam = sp.get("actif");
    const medicaments = await listerMedicaments({
      q: sp.get("q") ?? undefined,
      actif:
        actifParam === "true" ? true : actifParam === "false" ? false : undefined,
    });
    return NextResponse.json({ medicaments });
  } catch (error) {
    console.error("[GET /api/admin/medicaments]", error);
    return NextResponse.json(
      { message: "Impossible de charger les médicaments." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const medicament = await creerMedicament({
      code: String(body.code ?? ""),
      nom: String(body.nom ?? ""),
      categorie: body.categorie != null ? String(body.categorie) : null,
      forme: body.forme != null ? String(body.forme) : null,
      dosage: body.dosage != null ? String(body.dosage) : null,
      prixAchat:
        body.prixAchat != null && body.prixAchat !== ""
          ? Number(body.prixAchat)
          : null,
      prixUnitaire: Number(body.prixUnitaire),
      stockMinimum:
        body.stockMinimum != null ? Number(body.stockMinimum) : undefined,
      emplacement: body.emplacement != null ? String(body.emplacement) : null,
      actif: body.actif != null ? Boolean(body.actif) : undefined,
    });
    return NextResponse.json(
      { message: "Médicament créé.", medicament },
      { status: 201 }
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurCatalogue(code);
    if (msg) {
      return NextResponse.json({ message: msg }, { status: 400 });
    }
    console.error("[POST /api/admin/medicaments]", error);
    return NextResponse.json(
      { message: "Impossible de créer le médicament." },
      { status: 500 }
    );
  }
}
