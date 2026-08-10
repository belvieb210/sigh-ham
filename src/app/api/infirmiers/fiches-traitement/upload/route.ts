import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiInfirmiers } from "@/lib/auth/garde-api-infirmiers";
import { attacherFichierFicheTraitement } from "@/lib/infirmiers/gestion-fiche-traitement";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiInfirmiers();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const ficheId = String(form.get("ficheId") ?? "").trim();
    const fichier = form.get("fichier");
    if (!ficheId || !fichier || typeof fichier === "string") {
      return NextResponse.json({ message: "Fiche et fichier requis." }, { status: 400 });
    }

    const blob = fichier as Blob;
    if (blob.size === 0) {
      return NextResponse.json({ message: "Fichier vide." }, { status: 400 });
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const nom =
      fichier instanceof File && fichier.name ? fichier.name : "document";
    const typeMime =
      fichier instanceof File && fichier.type
        ? fichier.type
        : "application/octet-stream";

    const url = await attacherFichierFicheTraitement(
      ficheId,
      buffer,
      nom,
      typeMime
    );

    return NextResponse.json({
      message: "Fichier ajouté.",
      url,
      nom,
      typeMime,
    });
  } catch (error) {
    console.error("[POST /api/infirmiers/fiches-traitement/upload]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Import impossible." },
      { status: 400 }
    );
  }
}
