import "server-only";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { utilisateurPeutAccederSalle } from "@/lib/auth/redirections";

export async function obtenirSessionApiMedecins() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;

  if (!utilisateurPeutAccederSalle("MEDECINS", session.utilisateur.role)) {
    return null;
  }

  return session;
}
