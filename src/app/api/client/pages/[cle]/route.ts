import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCachePagePublique } from "@/lib/client/invalider-cache-vitrine";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ cle: string }>;
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { cle } = await ctx.params;

  try {
    const page = await prisma.pagePublique.findUnique({ where: { cle } });
    if (!page) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    console.error("[GET /api/client/pages/[cle]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { cle } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    let contenu = body.contenu;
    if (typeof contenu === "string") {
      try {
        contenu = JSON.parse(contenu);
      } catch {
        return NextResponse.json(
          { message: "JSON contenu invalide." },
          { status: 400 }
        );
      }
    }
    const page = await prisma.pagePublique.update({
      where: { cle },
      data: {
        ...(body.titre != null ? { titre: String(body.titre) } : {}),
        ...(contenu !== undefined ? { contenu: contenu as object } : {}),
        ...(body.publie != null ? { publie: Boolean(body.publie) } : {}),
      },
    });
    invaliderCachePagePublique(cle);
    return NextResponse.json({ page });
  } catch (error) {
    console.error("[PUT /api/client/pages/[cle]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { cle } = await ctx.params;

  try {
    await prisma.pagePublique.delete({ where: { cle } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/pages/[cle]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
