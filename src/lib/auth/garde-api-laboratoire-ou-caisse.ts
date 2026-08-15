import "server-only";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { utilisateurPeutAccederSalle } from "@/lib/auth/redirections";

/** Session autorisée pour consulter / imprimer les PDF résultats (labo ou caisse). */
export async function obtenirSessionApiLaboratoireOuCaisse() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;

  const role = session.utilisateur.role;
  if (
    utilisateurPeutAccederSalle("LABORATOIRE", role) ||
    utilisateurPeutAccederSalle("CAISSE", role)
  ) {
    return session;
  }

  return null;
}
