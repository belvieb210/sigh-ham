import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContenuConnexion } from "@/features/connexion/contenu-connexion";
import { lireSessionDepuisCookie, supprimerCookieSession } from "@/lib/auth/session";
import { obtenirRouteApresConnexion } from "@/lib/auth/redirections";

export const metadata: Metadata = {
  title: "Connexion — Espace personnel",
  description: "Accès réservé au personnel de HAM Laboratoire.",
  robots: { index: false, follow: false },
};

export default async function PageConnexion() {
  const session = await lireSessionDepuisCookie();
  if (session) {
    redirect(obtenirRouteApresConnexion(session.utilisateur.role));
  }

  /** Cookie présent mais session absente (import DB) — nettoyer */
  try {
    await supprimerCookieSession();
  } catch {
    /* ignore si non mutable dans ce contexte */
  }

  return <ContenuConnexion />;
}
