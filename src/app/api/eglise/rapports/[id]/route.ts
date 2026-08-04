import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { prisma } from "@/lib/prisma";

/**
 * Proxy PDF authentifié — l'Église n'accède pas aux APIs labo internes.
 * ?type=certificat pour le certificat, sinon le rapport.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const type = request.nextUrl.searchParams.get("type");

  const prenuptial = await prisma.examenPrenuptial.findUnique({
    where: { id },
    select: { rapportPdfUrl: true, certificatUrl: true, dossier: { select: { numeroDossier: true } } },
  });
  if (!prenuptial) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }

  const url =
    type === "certificat" ? prenuptial.certificatUrl : prenuptial.rapportPdfUrl;
  if (!url) {
    return NextResponse.json({ message: "Fichier indisponible." }, { status: 404 });
  }

  try {
    if (url.startsWith("/")) {
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      const relatif = url.replace(/^\//, "");
      const chemin = join(process.cwd(), "public", relatif);
      const buffer = await readFile(chemin);
      const nom =
        type === "certificat"
          ? `certificat-${prenuptial.dossier.numeroDossier}.pdf`
          : `rapport-${prenuptial.dossier.numeroDossier}.pdf`;
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${nom}"`,
        },
      });
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { message: "Impossible de récupérer le fichier." },
        { status: 502 }
      );
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const nom =
      type === "certificat"
        ? `certificat-${prenuptial.dossier.numeroDossier}.pdf`
        : `rapport-${prenuptial.dossier.numeroDossier}.pdf`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nom}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/eglise/rapports/:id]", error);
    return NextResponse.json(
      { message: "Erreur de lecture du fichier." },
      { status: 500 }
    );
  }
}
