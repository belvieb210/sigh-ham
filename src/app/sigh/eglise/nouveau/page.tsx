import type { Metadata } from "next";
import { ContenuNouveauEglise } from "@/features/eglise/contenu-nouveau-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Nouveau patient — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuNouveauEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
