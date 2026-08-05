import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  creerTypeExamen,
  listerTypesExamen,
  messageErreurCatalogue,
} from "@/lib/admin/catalogues";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const sp = request.nextUrl.searchParams;
    const actifParam = sp.get("actif");
    const examens = await listerTypesExamen({
      q: sp.get("q") ?? undefined,
      actif:
        actifParam === "true" ? true : actifParam === "false" ? false : undefined,
    });
    return NextResponse.json({ examens });
  } catch (error) {
    console.error("[GET /api/admin/examens]", error);
    return NextResponse.json(
      { message: "Impossible de charger les examens." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const examen = await creerTypeExamen({
      code: String(body.code ?? ""),
      libelle: String(body.libelle ?? ""),
      categorie: String(body.categorie ?? ""),
      prix: Number(body.prix),
      delaiHeures:
        body.delaiHeures != null ? Number(body.delaiHeures) : undefined,
      actif: body.actif != null ? Boolean(body.actif) : undefined,
      packPrenuptial:
        body.packPrenuptial != null ? Boolean(body.packPrenuptial) : undefined,
    });
    return NextResponse.json({ message: "Examen créé.", examen }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurCatalogue(code);
    if (msg) {
      return NextResponse.json({ message: msg }, { status: 400 });
    }
    console.error("[POST /api/admin/examens]", error);
    return NextResponse.json(
      { message: "Impossible de créer l'examen." },
      { status: 500 }
    );
  }
}
