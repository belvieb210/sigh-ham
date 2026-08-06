import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

function parserImages(body: Record<string, unknown>): { url: string }[] | null {
  if (body.images === undefined) return null;
  const raw = body.images;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { url: item };
      if (item && typeof item === "object" && "url" in item) {
        return { url: String((item as { url: unknown }).url) };
      }
      return null;
    })
    .filter((x): x is { url: string } => Boolean(x?.url));
}

async function syncImages(serviceId: string, images: { url: string }[]) {
  await prisma.serviceVitrineImage.deleteMany({ where: { serviceId } });
  if (images.length === 0) return;
  await prisma.serviceVitrineImage.createMany({
    data: images.map((img, ordre) => ({
      serviceId,
      url: img.url,
      ordre,
    })),
  });
}

const includeImages = { images: { orderBy: { ordre: "asc" as const } } };

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
    const images = parserImages(body);
    const service = await prisma.serviceVitrine.update({
      where: { id },
      data: {
        ...(body.slug != null ? { slug: String(body.slug).trim() } : {}),
        ...(body.titre != null ? { titre: String(body.titre).trim() } : {}),
        ...(body.description != null
          ? { description: String(body.description) }
          : {}),
        ...(images
          ? { imageUrl: images[0]?.url ?? null }
          : body.imageUrl !== undefined
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
        ...(body.estPhare != null ? { estPhare: Boolean(body.estPhare) } : {}),
      },
    });
    if (images) await syncImages(id, images);
    const fresh = await prisma.serviceVitrine.findUnique({
      where: { id },
      include: includeImages,
    });
    return NextResponse.json({
      service: {
        ...(fresh ?? service),
        images: (fresh?.images ?? []).map((i) => ({
          url: i.url,
          legende: i.legende,
        })),
      },
    });
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
