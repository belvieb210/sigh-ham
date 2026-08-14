import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { invaliderCacheGalerie } from "@/lib/client/invalider-cache-vitrine";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const medias = await prisma.mediaGalerie.findMany({
      orderBy: [{ album: "asc" }, { ordre: "asc" }],
    });
    return NextResponse.json({ medias });
  } catch (error) {
    console.error("[GET /api/client/galerie]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const url = String(body.url ?? "").trim();
    if (!url) {
      return NextResponse.json({ message: "url requise." }, { status: 400 });
    }
    const media = await prisma.mediaGalerie.create({
      data: {
        url,
        type: String(body.type ?? "image"),
        legende: body.legende ? String(body.legende) : null,
        album: String(body.album ?? "general"),
        ordre: Number(body.ordre ?? 0),
        actif: body.actif !== false,
      },
    });
    invaliderCacheGalerie();
    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/galerie]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
