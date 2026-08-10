import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { attacherPdfUploadEstimation } from "@/lib/eglise/estimations-convention";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const estimationId = String(form.get("estimationId") ?? "").trim();
    const fichier = form.get("fichier");
    if (!estimationId || !fichier || typeof fichier === "string") {
      return NextResponse.json({ message: "Fichier requis." }, { status: 400 });
    }
    const blob = fichier as Blob;
    if (blob.size === 0) {
      return NextResponse.json({ message: "Fichier vide." }, { status: 400 });
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    const nom = fichier instanceof File && fichier.name ? fichier.name : "estimation.pdf";
    await attacherPdfUploadEstimation(estimationId, buffer, nom);
    return NextResponse.json({ message: "PDF importé avec succès." });
  } catch (error) {
    console.error("[POST /api/eglise/estimations/upload]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Import impossible." },
      { status: 400 }
    );
  }
}
