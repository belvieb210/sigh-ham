import { NextRequest, NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import {
  mettreAJourPhotoProfil,
  supprimerPhotoProfil,
} from "@/lib/auth/profil-utilisateur";

export async function POST(request: NextRequest) {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const photoEntree = formData.get("photo");
    const photo =
      photoEntree instanceof File && photoEntree.size > 0 ? photoEntree : null;

    if (!photo) {
      return NextResponse.json({ message: "Aucune photo fournie." }, { status: 400 });
    }

    const profil = await mettreAJourPhotoProfil(session.utilisateur.id, photo);
    return NextResponse.json({
      message: "Photo de profil mise à jour.",
      profil,
    });
  } catch (error) {
    console.error("[POST /api/auth/profil/photo]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'upload de la photo.";
    const status =
      message.includes("Format") || message.includes("dépasser") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE() {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const profil = await supprimerPhotoProfil(session.utilisateur.id);
    return NextResponse.json({
      message: "Photo de profil supprimée.",
      profil,
    });
  } catch (error) {
    console.error("[DELETE /api/auth/profil/photo]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
