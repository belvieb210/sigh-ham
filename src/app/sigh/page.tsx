import { redirect } from "next/navigation";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

export default async function PageSighAccueil() {
  const session = await lireSessionDepuisCookie();
  if (!session) {
    /** Nettoie le cookie invalide puis affiche la connexion (évite boucle de redirects) */
    redirect("/api/auth/nettoyer-session");
  }
  redirect(obtenirRouteApresConnexion(session.utilisateur.role));
}
