import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Mon profil — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurEglise(utilisateur)}
      salle="eglise"
    />
  );
}
