import "server-only";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { utilisateurPeutAccederSalle } from "@/lib/auth/redirections";

export async function obtenirSessionApiEglise() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;
  if (!utilisateurPeutAccederSalle("EGLISE", session.utilisateur.role)) {
    return null;
  }
  return session;
}
