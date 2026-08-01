import { redirect } from "next/navigation";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

export default async function PageSighAccueil() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");
  redirect(obtenirRouteApresConnexion(session.utilisateur.role));
}
