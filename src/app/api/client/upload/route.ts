import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { uploaderFichier } from "@/lib/stockage/fichiers";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const form = await request.formData();
    const fichier = form.get("fichier");
    if (!(fichier instanceof File)) {
      return NextResponse.json(
        { message: "Fichier manquant (champ fichier)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await uploaderFichier(
      buffer,
      fichier.name || "upload.bin",
      fichier.type || "application/octet-stream"
    );

    return NextResponse.json({
      url: resultat.url,
      nom: resultat.nom,
      mimeType: resultat.mimeType,
      taille: resultat.taille,
    });
  } catch (error) {
    console.error("[POST /api/client/upload]", error);
    return NextResponse.json(
      { message: "Échec de l'upload." },
      { status: 500 }
    );
  }
}
