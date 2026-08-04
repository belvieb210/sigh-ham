import type { Metadata } from "next";
import { ContenuRapportsEglise } from "@/features/eglise/contenu-rapports-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Rapports PDF — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuRapportsEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
