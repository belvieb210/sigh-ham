import { NextRequest, NextResponse } from "next/server";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import { sauvegarderPhotoUtilisateur } from "@/lib/auth/photo-utilisateur";

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  try {
    const formData = await request.formData();
    const photoEntree = formData.get("photo");
    const photo =
      photoEntree instanceof File && photoEntree.size > 0 ? photoEntree : null;

    if (!photo) {
      return NextResponse.json({ message: "Aucune photo fournie." }, { status: 400 });
    }

    const photoUrl = await sauvegarderPhotoUtilisateur(
      `gouvernance-${session.utilisateur.id}`,
      photo
    );

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("[POST /api/admin/gouvernance/upload]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Upload de la photo impossible.",
      },
      { status: 400 }
    );
  }
}
