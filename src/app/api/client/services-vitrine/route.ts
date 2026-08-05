import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const services = await prisma.serviceVitrine.findMany({
      orderBy: { ordre: "asc" },
    });
    return NextResponse.json({ services });
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
    const service = await prisma.serviceVitrine.create({
      data: {
        slug,
        titre,
        description: String(body.description ?? ""),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        categorie: String(body.categorie ?? "diagnostic"),
        pointsJson: points,
        badge: body.badge ? String(body.badge) : null,
        href: body.href ? String(body.href) : null,
        icone: String(body.icone ?? "laboratoire"),
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
      },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/services-vitrine]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
