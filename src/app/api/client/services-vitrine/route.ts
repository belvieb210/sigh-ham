import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

function parserImages(body: Record<string, unknown>): { url: string; legende?: string }[] {
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

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const services = await prisma.serviceVitrine.findMany({
      include: includeImages,
      orderBy: { ordre: "asc" },
    });
    return NextResponse.json({
      services: services.map((s) => ({
        ...s,
        images: s.images.map((i) => ({ url: i.url, legende: i.legende })),
      })),
    });
  } catch (error) {
    console.error("[GET /api/client/services-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const slug = String(body.slug ?? "").trim();
    const titre = String(body.titre ?? "").trim();
    if (!slug || !titre) {
      return NextResponse.json(
        { message: "slug et titre requis." },
        { status: 400 }
      );
    }
    const points = Array.isArray(body.points)
      ? body.points
      : Array.isArray(body.pointsJson)
        ? body.pointsJson
        : [];
    const images = parserImages(body);
    const service = await prisma.serviceVitrine.create({
      data: {
        slug,
        titre,
        description: String(body.description ?? ""),
        imageUrl: images[0]?.url ?? (body.imageUrl ? String(body.imageUrl) : null),
        categorie: String(body.categorie ?? "diagnostic"),
        pointsJson: points,
        badge: body.badge ? String(body.badge) : null,
        href: body.href ? String(body.href) : null,
        icone: String(body.icone ?? "laboratoire"),
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
        estPhare: Boolean(body.estPhare),
      },
    });
    await syncImages(service.id, images);
    const fresh = await prisma.serviceVitrine.findUnique({
      where: { id: service.id },
      include: includeImages,
    });
    return NextResponse.json(
      {
        service: {
          ...fresh!,
          images: fresh!.images.map((i) => ({ url: i.url, legende: i.legende })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/client/services-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
