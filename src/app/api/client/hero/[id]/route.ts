import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheHero } from "@/lib/client/invalider-cache-vitrine";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const diapositive = await prisma.diapositiveHero.update({
      where: { id },
      data: {
        ...(body.url != null ? { url: String(body.url) } : {}),
        ...(body.alt != null ? { alt: String(body.alt) } : {}),
        ...(body.titre !== undefined
          ? { titre: body.titre ? String(body.titre) : null }
          : {}),
        ...(body.lienHref !== undefined
          ? { lienHref: body.lienHref ? String(body.lienHref) : null }
          : {}),
        ...(body.ordre != null ? { ordre: Number(body.ordre) } : {}),
        ...(body.actif != null ? { actif: Boolean(body.actif) } : {}),
      },
    });
    invaliderCacheHero();
    return NextResponse.json({ diapositive });
  } catch (error) {
    console.error("[PUT /api/client/hero/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    await prisma.diapositiveHero.delete({ where: { id } });
    invaliderCacheHero();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/hero/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
