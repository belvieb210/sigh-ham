import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuReinitialisationMotDePasse } from "@/features/connexion/contenu-reinitialisation-mot-de-passe";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  description:
    "Réinitialisez votre mot de passe pour accéder à l'espace personnel HAM Laboratoire.",
  robots: { index: false, follow: false },
};

export default function PageMotDePasseOublie() {
  return (
    <Suspense fallback={null}>
      <ContenuReinitialisationMotDePasse />
    </Suspense>
  );
}
