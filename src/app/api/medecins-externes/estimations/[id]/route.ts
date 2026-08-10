import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import {
  envoyerEstimationMedecinExterneVersCaisse,
  obtenirEstimationMedecinExterne,
} from "@/lib/medecins-externes/estimations-medecin-externe";

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
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const estimation = await obtenirEstimationMedecinExterne(id);
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
    console.error("[GET /api/medecins-externes/estimations/[id]]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "PDF indisponible." },
      { status: 404 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { id } = await context.params;
    const body = (await request.json()) as { action?: string };
    if (body.action !== "envoyer-caisse") {
      return NextResponse.json({ message: "Action invalide." }, { status: 400 });
    }

    const estimation = await envoyerEstimationMedecinExterneVersCaisse(
      session.utilisateur.id,
      medecinExterneId,
      id
    );
    return NextResponse.json({
      message:
        "Estimation transmise à la caisse. Confirmez le transfert via le menu ⋮.",
      estimation,
    });
  } catch (error) {
    console.error("[POST /api/medecins-externes/estimations/[id]]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Action impossible.",
      },
      { status: 400 }
    );
  }
}
