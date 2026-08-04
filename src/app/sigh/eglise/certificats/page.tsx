import type { Metadata } from "next";
import { ContenuCertificatsEglise } from "@/features/eglise/contenu-certificats-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Certificats — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuCertificatsEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
