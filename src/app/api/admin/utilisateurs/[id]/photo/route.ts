import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { mettreAJourPhotoUtilisateurAdmin } from "@/lib/admin/utilisateurs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const photoEntree = formData.get("photo");
    const photo =
      photoEntree instanceof File && photoEntree.size > 0 ? photoEntree : null;
    if (!photo) {
      return NextResponse.json({ message: "Aucune photo fournie." }, { status: 400 });
    }

    const utilisateur = await mettreAJourPhotoUtilisateurAdmin(
      { id: session.utilisateur.id },
      id,
      photo
    );
    return NextResponse.json({
      message: "Photo mise à jour.",
      utilisateur,
    });
  } catch (error) {
    console.error("[POST /api/admin/utilisateurs/:id/photo]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Upload de la photo impossible.",
      },
      { status: 400 }
    );
  }
}
