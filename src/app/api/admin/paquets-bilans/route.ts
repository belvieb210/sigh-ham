import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  creerPaquetBilan,
  listerPaquetsBilans,
  messageErreurPaquet,
} from "@/lib/admin/paquets-bilans";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const sp = request.nextUrl.searchParams;
    const actifParam = sp.get("actif");
    const paquets = await listerPaquetsBilans({
      q: sp.get("q") ?? undefined,
      actif:
        actifParam === "true" ? true : actifParam === "false" ? false : undefined,
    });
    return NextResponse.json({ paquets });
  } catch (error) {
    console.error("[GET /api/admin/paquets-bilans]", error);
    return NextResponse.json(
      { message: "Impossible de charger les paquets bilans." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const typeExamenIds = Array.isArray(body.typeExamenIds)
      ? body.typeExamenIds.map(String)
      : [];
    const paquet = await creerPaquetBilan({
      code: String(body.code ?? ""),
      libelle: String(body.libelle ?? ""),
      description: body.description != null ? String(body.description) : null,
      prix: Number(body.prix),
      actif: body.actif != null ? Boolean(body.actif) : undefined,
      ordre: body.ordre != null ? Number(body.ordre) : undefined,
      typeExamenIds,
    });
    return NextResponse.json(
      { message: "Paquet bilan créé.", paquet },
      { status: 201 }
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurPaquet(code);
    if (msg) return NextResponse.json({ message: msg }, { status: 400 });
    console.error("[POST /api/admin/paquets-bilans]", error);
    return NextResponse.json(
      { message: "Impossible de créer le paquet." },
      { status: 500 }
    );
  }
}
