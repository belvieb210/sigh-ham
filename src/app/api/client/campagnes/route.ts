import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";
import { campagneDbVersPublication } from "@/lib/client/mapper-campagne";

function parserCorps(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "").trim();
  const titre = String(body.titre ?? "").trim();
  if (!slug || !titre) {
    return { erreur: "slug et titre requis." as const };
  }
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
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      lieu: body.lieu ? String(body.lieu) : null,
      couleurFond: String(body.couleurFond ?? "bg-bleu-medical-clair"),
      couleurIllustration: String(
        body.couleurIllustration ?? "from-bleu-medical/15 to-bleu-medical-clair"
      ),
      couleurAccent: String(body.couleurAccent ?? "text-bleu-medical"),
      icone: String(body.icone ?? "coeur"),
      datePublication: body.datePublication
        ? new Date(String(body.datePublication))
        : body.publie
          ? new Date()
          : null,
    },
  };
}

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const rows = await prisma.campagnePublique.findMany({
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
    const row = await prisma.campagnePublique.create({ data: parse.data });
    return NextResponse.json(
      { campagne: campagneDbVersPublication(row) },
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
