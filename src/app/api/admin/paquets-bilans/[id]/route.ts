import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  mettreAJourPaquetBilan,
  messageErreurPaquet,
  obtenirPaquetBilan,
} from "@/lib/admin/paquets-bilans";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const { id } = await context.params;
    const paquet = await obtenirPaquetBilan(id);
    return NextResponse.json({ paquet });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurPaquet(code);
    if (msg) return NextResponse.json({ message: msg }, { status: 404 });
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const paquet = await mettreAJourPaquetBilan(id, {
      ...(body.code != null ? { code: String(body.code) } : {}),
      ...(body.libelle != null ? { libelle: String(body.libelle) } : {}),
      ...(body.description !== undefined
        ? { description: body.description != null ? String(body.description) : null }
        : {}),
      ...(body.prix != null ? { prix: Number(body.prix) } : {}),
      ...(body.actif != null ? { actif: Boolean(body.actif) } : {}),
      ...(body.ordre != null ? { ordre: Number(body.ordre) } : {}),
      ...(Array.isArray(body.typeExamenIds)
        ? { typeExamenIds: body.typeExamenIds.map(String) }
        : {}),
    });
    return NextResponse.json({ message: "Paquet mis à jour.", paquet });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const msg = messageErreurPaquet(code);
    if (msg) return NextResponse.json({ message: msg }, { status: 400 });
    console.error("[PATCH /api/admin/paquets-bilans/[id]]", error);
    return NextResponse.json({ message: "Mise à jour impossible." }, { status: 500 });
  }
}
