import type { Metadata } from "next";
import { ContenuPageEgliseAvenir } from "@/features/eglise/contenu-page-avenir-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Paramètres — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuPageEgliseAvenir
      utilisateur={propsUtilisateurEglise(utilisateur)}
      page="parametres"
    />
  );
}
