import { NextResponse } from "next/server";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

export async function GET() {
  const session = await lireSessionDepuisCookie();

  if (!session) {
    return NextResponse.json({ authentifie: false }, { status: 401 });
  }

  const { utilisateur } = session;

  return NextResponse.json({
    authentifie: true,
    redirect: obtenirRouteApresConnexion(utilisateur.role),
    utilisateur: {
      id: utilisateur.id,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      email: utilisateur.email,
      identifiant: utilisateur.identifiant,
      role: {
        code: utilisateur.role.code,
        nom: utilisateur.role.nom,
        salle: utilisateur.role.salle
          ? {
              code: utilisateur.role.salle.code,
              nom: utilisateur.role.salle.nom,
            }
          : null,
      },
    },
  });
}
