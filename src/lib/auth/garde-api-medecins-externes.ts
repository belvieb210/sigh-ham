import "server-only";
import { lireSessionDepuisCookie } from "@/lib/auth/session";
import { utilisateurPeutAccederSalle } from "@/lib/auth/redirections";
import { assurerFicheMedecinExterne } from "@/lib/medecins-externes/assurer-fiche";

export async function obtenirSessionApiMedecinsExternes() {
  const session = await lireSessionDepuisCookie();
  if (!session) return null;
  if (
    !utilisateurPeutAccederSalle(
      "MEDECINS_EXTERNES",
      session.utilisateur.role
    )
  ) {
    return null;
  }
  const utilisateur = await assurerFicheMedecinExterne(session.utilisateur);
  return { ...session, utilisateur };
}
