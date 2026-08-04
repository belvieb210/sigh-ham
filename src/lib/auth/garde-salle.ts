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

export async function verifierAccesCaisse() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");

  if (!utilisateurPeutAccederSalle("CAISSE", session.utilisateur.role)) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  return session.utilisateur;
}

export async function verifierAccesLaboratoire() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");

  if (!utilisateurPeutAccederSalle("LABORATOIRE", session.utilisateur.role)) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  return session.utilisateur;
}

export async function verifierAccesMedecins() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");

  if (!utilisateurPeutAccederSalle("MEDECINS", session.utilisateur.role)) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  return session.utilisateur;
}

export async function verifierAccesInfirmiers() {
  const session = await lireSessionDepuisCookie();
  if (!session) redirect("/connexion");

  if (!utilisateurPeutAccederSalle("INFIRMIERS", session.utilisateur.role)) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  return session.utilisateur;
}
