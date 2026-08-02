import { NextRequest, NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import {
  mettreAJourProfilUtilisateur,
  obtenirProfilUtilisateur,
  type DonneesMiseAJourProfil,
} from "@/lib/auth/profil-utilisateur";

export async function GET() {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const profil = await obtenirProfilUtilisateur(session.utilisateur.id);
    if (!profil) {
      return NextResponse.json({ message: "Profil introuvable." }, { status: 404 });
    }
    return NextResponse.json({ profil });
  } catch (error) {
    console.error("[GET /api/auth/profil]", error);
    return NextResponse.json(
      { message: "Impossible de charger le profil." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<DonneesMiseAJourProfil> & {
      roleId?: unknown;
      role?: unknown;
      identifiant?: unknown;
    };

    if ("roleId" in body || "role" in body || "identifiant" in body) {
      return NextResponse.json(
        { message: "Le rôle et l'identifiant ne peuvent pas être modifiés ici." },
        { status: 403 }
      );
    }

    const profil = await mettreAJourProfilUtilisateur(session.utilisateur.id, {
      prenom: String(body.prenom ?? ""),
      nom: String(body.nom ?? ""),
      email: body.email === undefined ? undefined : body.email,
      telephone: body.telephone === undefined ? undefined : body.telephone,
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès.",
      profil,
    });
  } catch (error) {
    console.error("[PATCH /api/auth/profil]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la mise à jour.";
    const status =
      message.includes("déjà utilisée") ||
      message.includes("obligatoire") ||
      message.includes("invalide")
        ? 400
        : 500;
    return NextResponse.json({ message }, { status });
  }
}
