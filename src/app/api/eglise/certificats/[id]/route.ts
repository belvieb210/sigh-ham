import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import { emettreCertificatPrenuptial } from "@/lib/eglise/emettre-certificat";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const resultat = await emettreCertificatPrenuptial(id);
    return NextResponse.json({
      message: resultat.dejaExistant
        ? "Certificat déjà émis."
        : "Certificat généré.",
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/eglise/certificats/:id]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Émission impossible.",
      },
      { status: 400 }
    );
  }
}
