import { NextRequest, NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { changerMotDePasseUtilisateur } from "@/lib/auth/profil-utilisateur";

export async function POST(request: NextRequest) {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      actuel?: string;
      nouveau?: string;
      confirmation?: string;
    };

    await changerMotDePasseUtilisateur(
      session.utilisateur.id,
      session.id,
      String(body.actuel ?? ""),
      String(body.nouveau ?? ""),
      String(body.confirmation ?? "")
    );

    return NextResponse.json({
      message: "Mot de passe modifié. Les autres sessions ont été déconnectées.",
    });
  } catch (error) {
    console.error("[POST /api/auth/profil/mot-de-passe]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors du changement de mot de passe.";
    const status =
      message.includes("incorrect") ||
      message.includes("obligatoire") ||
      message.includes("caractères") ||
      message.includes("correspond") ||
      message.includes("différent") ||
      message.includes("lettre")
        ? 400
        : 500;
    return NextResponse.json({ message }, { status });
  }
}
