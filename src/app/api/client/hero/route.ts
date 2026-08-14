import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheHero } from "@/lib/client/invalider-cache-vitrine";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const diapositives = await prisma.diapositiveHero.findMany({
      orderBy: { ordre: "asc" },
    });
    return NextResponse.json({ diapositives });
  } catch (error) {
    console.error("[GET /api/client/hero]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const url = String(body.url ?? "").trim();
    const alt = String(body.alt ?? "").trim();
    if (!url || !alt) {
      return NextResponse.json(
        { message: "url et alt requis." },
        { status: 400 }
      );
    }
    const diapositive = await prisma.diapositiveHero.create({
      data: {
        url,
        alt,
        titre: body.titre ? String(body.titre) : null,
        lienHref: body.lienHref ? String(body.lienHref) : null,
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
      },
    });
    invaliderCacheHero();
    return NextResponse.json({ diapositive }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/hero]", error);
    return NextResponse.json({ message: "Erreur création." }, { status: 500 });
  }
}
