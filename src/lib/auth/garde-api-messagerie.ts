import "server-only";
import { lireSessionDepuisCookie } from "@/lib/auth/session";

/** Session active — la messagerie est transversale à toutes les salles SIGH. */
export async function obtenirSessionApiMessagerie() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;
  if (session.utilisateur.statut !== "ACTIF") return null;
  return session;
}
