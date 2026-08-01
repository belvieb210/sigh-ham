import "server-only";
import { redirect } from "next/navigation";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

/** Accès SIGH transversal (messagerie, notifications) — tout personnel connecté. */
export async function verifierAccesSigh() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");
  if (session.utilisateur.statut !== "ACTIF") {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }
  return session.utilisateur;
}
