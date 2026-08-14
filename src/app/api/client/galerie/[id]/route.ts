import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheGalerie } from "@/lib/client/invalider-cache-vitrine";
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
    const media = await prisma.mediaGalerie.update({
      where: { id },
      data: {
        ...(body.url != null ? { url: String(body.url) } : {}),
        ...(body.type != null ? { type: String(body.type) } : {}),
        ...(body.legende !== undefined
          ? { legende: body.legende ? String(body.legende) : null }
          : {}),
        ...(body.album != null ? { album: String(body.album) } : {}),
        ...(body.ordre != null ? { ordre: Number(body.ordre) } : {}),
        ...(body.actif != null ? { actif: Boolean(body.actif) } : {}),
      },
    });
    invaliderCacheGalerie();
    return NextResponse.json({ media });
  } catch (error) {
    console.error("[PUT /api/client/galerie/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    await prisma.mediaGalerie.delete({ where: { id } });
    invaliderCacheGalerie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/galerie/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
