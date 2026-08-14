import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheCampagnes } from "@/lib/client/invalider-cache-vitrine";
import { versHexPourInputCouleur } from "@/lib/client/couleurs-campagne";
import {
  campagneDbVersPublication,
  synchroniserImagesCampagne,
} from "@/lib/client/mapper-campagne";
import { prisma } from "@/lib/prisma";

function parserImages(body: Record<string, unknown>): { url: string; legende?: string }[] {
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

function parserCorps(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "").trim();
  const titre = String(body.titre ?? "").trim();
  if (!slug || !titre) {
    return { erreur: "slug et titre requis." as const };
  }
  const images = parserImages(body);
  const imageUrl =
    images[0]?.url ?? (body.imageUrl ? String(body.imageUrl) : null);
  return {
    data: {
      slug,
      titre,
      extrait: String(body.extrait ?? ""),
      description: String(body.description ?? ""),
      periode: String(body.periode ?? ""),
      dateDebut: new Date(String(body.dateDebut ?? new Date().toISOString())),
      dateFin: new Date(String(body.dateFin ?? new Date().toISOString())),
      categorie: String(body.categorie ?? "sensibilisation"),
      typePublication: String(body.typePublication ?? "campagne"),
      publie: Boolean(body.publie),
      misEnAvant: Boolean(body.misEnAvant),
      imageUrl,
      lieu: body.lieu ? String(body.lieu) : null,
      couleurFond: versHexPourInputCouleur(
        String(body.couleurFond ?? "#E8F4FC"),
        "#E8F4FC"
      ),
      couleurIllustration: versHexPourInputCouleur(
        String(body.couleurIllustration ?? "#0B6E99"),
        "#0B6E99"
      ),
      couleurAccent: versHexPourInputCouleur(
        String(body.couleurAccent ?? "#0B6E99"),
        "#0B6E99"
      ),
      icone: String(body.icone ?? "coeur"),
      datePublication: body.datePublication
        ? new Date(String(body.datePublication))
        : body.publie
          ? new Date()
          : null,
    },
    images,
  };
}

const includeImages = {
  images: { orderBy: { ordre: "asc" as const } },
};

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const rows = await prisma.campagnePublique.findMany({
      include: includeImages,
      orderBy: [{ updatedAt: "desc" }],
    });
    return NextResponse.json({
      campagnes: rows.map(campagneDbVersPublication),
    });
  } catch (error) {
    console.error("[GET /api/client/campagnes]", error);
    return NextResponse.json(
      { message: "Impossible de lister les campagnes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parse = parserCorps(body);
    if ("erreur" in parse) {
      return NextResponse.json({ message: parse.erreur }, { status: 400 });
    }
    const row = await prisma.campagnePublique.create({
      data: parse.data,
      include: includeImages,
    });
    await synchroniserImagesCampagne(prisma, row.id, parse.images);
    const fresh = await prisma.campagnePublique.findUnique({
      where: { id: row.id },
      include: includeImages,
    });
    invaliderCacheCampagnes({ slug: fresh!.slug });
    return NextResponse.json(
      { campagne: campagneDbVersPublication(fresh!) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/client/campagnes]", error);
    return NextResponse.json(
      { message: "Impossible de créer la campagne." },
      { status: 500 }
    );
  }
}
