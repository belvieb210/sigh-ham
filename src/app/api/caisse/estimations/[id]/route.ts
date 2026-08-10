import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { obtenirEstimationConvention } from "@/lib/eglise/estimations-convention";

async function lirePdfDepuisUrl(url: string): Promise<Buffer> {
  if (url.startsWith("/")) {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const relatif = url.replace(/^\//, "");
    const chemin = join(process.cwd(), "public", relatif);
    return readFile(chemin);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Impossible de récupérer le fichier.");
  return Buffer.from(await res.arrayBuffer());
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const estimation = await obtenirEstimationConvention(id);
    if (estimation.statut !== "ENVOYEE_CAISSE" && estimation.statut !== "TRAITE") {
      return NextResponse.json({ message: "Estimation non disponible." }, { status: 403 });
    }
    if (!estimation.pdfUrl) {
      return NextResponse.json({ message: "PDF introuvable." }, { status: 404 });
    }

    const buffer = await lirePdfDepuisUrl(estimation.pdfUrl);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="estimation-${estimation.numeroDossier}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/caisse/estimations/[id]]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "PDF indisponible." },
      { status: 404 }
    );
  }
}
