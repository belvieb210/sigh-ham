import type { Metadata } from "next";
import { ContenuAccueilEglise } from "@/features/eglise/contenu-accueil-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Service Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuAccueilEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
