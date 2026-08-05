import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
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
    const points =
      body.points !== undefined
        ? body.points
        : body.pointsJson !== undefined
          ? body.pointsJson
          : undefined;
    const service = await prisma.serviceVitrine.update({
      where: { id },
      data: {
        ...(body.slug != null ? { slug: String(body.slug).trim() } : {}),
        ...(body.titre != null ? { titre: String(body.titre).trim() } : {}),
        ...(body.description != null
          ? { description: String(body.description) }
          : {}),
        ...(body.imageUrl !== undefined
          ? { imageUrl: body.imageUrl ? String(body.imageUrl) : null }
          : {}),
        ...(body.categorie != null
          ? { categorie: String(body.categorie) }
          : {}),
        ...(points !== undefined ? { pointsJson: points as object } : {}),
        ...(body.badge !== undefined
          ? { badge: body.badge ? String(body.badge) : null }
          : {}),
        ...(body.href !== undefined
          ? { href: body.href ? String(body.href) : null }
          : {}),
        ...(body.icone != null ? { icone: String(body.icone) } : {}),
        ...(body.ordre != null ? { ordre: Number(body.ordre) } : {}),
        ...(body.actif != null ? { actif: Boolean(body.actif) } : {}),
      },
    });
    return NextResponse.json({ service });
  } catch (error) {
    console.error("[PUT /api/client/services-vitrine/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    await prisma.serviceVitrine.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/services-vitrine/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
