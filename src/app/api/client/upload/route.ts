import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { uploaderFichier } from "@/lib/stockage/fichiers";

const MIME_IMAGES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_OCTETS = 5 * 1024 * 1024;

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

    const mime = fichier.type || "application/octet-stream";
    if (!MIME_IMAGES.has(mime)) {
      return NextResponse.json(
        { message: "Seules les images JPG, PNG, WebP ou GIF sont acceptées." },
        { status: 400 }
      );
    }

    if (fichier.size > MAX_OCTETS) {
      return NextResponse.json(
        { message: "Image trop lourde (maximum 5 Mo)." },
        { status: 400 }
      );
    }

    const dossierBrut = String(form.get("dossier") ?? "campagnes");
    const sousDossier =
      dossierBrut === "hero" ||
      dossierBrut === "galerie" ||
      dossierBrut === "campagnes" ||
      dossierBrut === "services" ||
      dossierBrut === "medecins"
        ? dossierBrut
        : "campagnes";

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await uploaderFichier(
      buffer,
      fichier.name || "image.jpg",
      mime,
      { sousDossier }
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
