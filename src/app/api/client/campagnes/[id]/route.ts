import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheCampagnes } from "@/lib/client/invalider-cache-vitrine";
import {
  campagneDbVersPublication,
  synchroniserImagesCampagne,
} from "@/lib/client/mapper-campagne";
import { versHexPourInputCouleur } from "@/lib/client/couleurs-campagne";
import { prisma } from "@/lib/prisma";

interface Ctx {
  params: Promise<{ id: string }>;
}

const includeImages = {
  images: { orderBy: { ordre: "asc" as const } },
};

function parserImages(body: Record<string, unknown>): { url: string; legende?: string }[] | null {
  if (body.images === undefined) return null;
  const raw = body.images;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return { url: item };
      if (item && typeof item === "object" && "url" in item) {
        return {
          url: String((item as { url: unknown }).url),
          legende:
            "legende" in item && (item as { legende?: unknown }).legende
              ? String((item as { legende: unknown }).legende)
              : undefined,
        };
      }
      return null;
    })
    .filter((x): x is { url: string; legende?: string } => Boolean(x?.url));
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const row = await prisma.campagnePublique.findUnique({
      where: { id },
      include: includeImages,
    });
    if (!row) {
      return NextResponse.json({ message: "Introuvable." }, { status: 404 });
    }
    return NextResponse.json({ campagne: campagneDbVersPublication(row) });
  } catch (error) {
    console.error("[GET /api/client/campagnes/[id]]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const images = parserImages(body);
    const imageUrlFromImages = images?.[0]?.url;
    const avant = await prisma.campagnePublique.findUnique({
      where: { id },
      select: { slug: true },
    });
    const row = await prisma.campagnePublique.update({
      where: { id },
      data: {
        ...(body.slug != null ? { slug: String(body.slug).trim() } : {}),
        ...(body.titre != null ? { titre: String(body.titre).trim() } : {}),
        ...(body.extrait != null ? { extrait: String(body.extrait) } : {}),
        ...(body.description != null
          ? { description: String(body.description) }
          : {}),
        ...(body.periode != null ? { periode: String(body.periode) } : {}),
        ...(body.dateDebut != null
          ? { dateDebut: new Date(String(body.dateDebut)) }
          : {}),
        ...(body.dateFin != null
          ? { dateFin: new Date(String(body.dateFin)) }
          : {}),
        ...(body.categorie != null
          ? { categorie: String(body.categorie) }
          : {}),
        ...(body.typePublication != null
          ? { typePublication: String(body.typePublication) }
          : {}),
        ...(body.publie != null ? { publie: Boolean(body.publie) } : {}),
        ...(body.misEnAvant != null
          ? { misEnAvant: Boolean(body.misEnAvant) }
          : {}),
        ...(images
          ? { imageUrl: imageUrlFromImages ?? null }
          : body.imageUrl !== undefined
            ? { imageUrl: body.imageUrl ? String(body.imageUrl) : null }
            : {}),
        ...(body.lieu !== undefined
          ? { lieu: body.lieu ? String(body.lieu) : null }
          : {}),
        ...(body.couleurFond != null
          ? {
              couleurFond: versHexPourInputCouleur(
                String(body.couleurFond),
                "#E8F4FC"
              ),
            }
          : {}),
        ...(body.couleurIllustration != null
          ? {
              couleurIllustration: versHexPourInputCouleur(
                String(body.couleurIllustration),
                "#0B6E99"
              ),
            }
          : {}),
        ...(body.couleurAccent != null
          ? {
              couleurAccent: versHexPourInputCouleur(
                String(body.couleurAccent),
                "#0B6E99"
              ),
            }
          : {}),
        ...(body.icone != null ? { icone: String(body.icone) } : {}),
        ...(body.datePublication !== undefined
          ? {
              datePublication: body.datePublication
                ? new Date(String(body.datePublication))
                : null,
            }
          : {}),
      },
      include: includeImages,
    });
    if (images) {
      await synchroniserImagesCampagne(prisma, id, images);
    }
    const fresh = await prisma.campagnePublique.findUnique({
      where: { id },
      include: includeImages,
    });
    const campagne = campagneDbVersPublication(fresh ?? row);
    invaliderCacheCampagnes({
      slug: campagne.slug,
      ancienSlug: avant?.slug,
    });
    return NextResponse.json({
      campagne,
    });
  } catch (error) {
    console.error("[PUT /api/client/campagnes/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de mettre à jour." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();
  const { id } = await ctx.params;

  try {
    const existante = await prisma.campagnePublique.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.campagnePublique.delete({ where: { id } });
    invaliderCacheCampagnes({ slug: existante?.slug });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/client/campagnes/[id]]", error);
    return NextResponse.json(
      { message: "Impossible de supprimer." },
      { status: 500 }
    );
  }
}
