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
    const pages = await prisma.pagePublique.findMany({
      orderBy: { cle: "asc" },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[GET /api/client/pages]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const cle = String(body.cle ?? "").trim();
    const titre = String(body.titre ?? "").trim();
    if (!cle || !titre) {
      return NextResponse.json(
        { message: "cle et titre requis." },
        { status: 400 }
      );
    }
    const page = await prisma.pagePublique.create({
      data: {
        cle,
        titre,
        contenu: (body.contenu as object) ?? {},
        publie: body.publie !== false,
      },
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/client/pages]", error);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}
