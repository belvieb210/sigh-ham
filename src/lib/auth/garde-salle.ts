import { redirect } from "next/navigation";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import {
  obtenirRouteApresConnexion,
  utilisateurPeutAccederSalle,
} from "@/lib/auth/redirections";

export async function verifierAccesReception() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");

  if (!utilisateurPeutAccederSalle("RECEPTION", session.utilisateur.role)) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  return session.utilisateur;
}
