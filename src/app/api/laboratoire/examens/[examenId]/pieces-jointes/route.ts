import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiLaboratoire } from "@/lib/auth/garde-api-laboratoire";
import { uploaderFichier } from "@/lib/stockage/fichiers";

const MIME_AUTORISES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_OCTETS = 8 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ examenId: string }> }
) {
  const session = await obtenirSessionApiLaboratoire();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { examenId } = await context.params;
  if (!examenId?.trim()) {
    return NextResponse.json({ erreur: "examenId requis." }, { status: 400 });
  }

  try {
    const form = await request.formData();
    const fichier = form.get("fichier");
    if (!(fichier instanceof File)) {
      return NextResponse.json({ erreur: "Fichier manquant." }, { status: 400 });
    }

    const mime = fichier.type || "application/octet-stream";
    if (!MIME_AUTORISES.has(mime)) {
      return NextResponse.json(
        { erreur: "Format non autorisé (images ou PDF uniquement)." },
        { status: 400 }
      );
    }

    if (fichier.size > MAX_OCTETS) {
      return NextResponse.json(
        { erreur: "Fichier trop lourd (maximum 8 Mo)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await uploaderFichier(
      buffer,
      fichier.name || "piece-jointe",
      mime,
      { sousDossier: "laboratoire-examens" }
    );

    return NextResponse.json({
      url: resultat.url,
      nom: resultat.nom,
      mimeType: resultat.mimeType,
      taille: resultat.taille,
    });
  } catch (e) {
    console.error("[POST /api/laboratoire/examens/.../pieces-jointes]", e);
    return NextResponse.json({ erreur: "Échec de l'upload." }, { status: 500 });
  }
}
