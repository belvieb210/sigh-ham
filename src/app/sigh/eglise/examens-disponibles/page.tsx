import type { Metadata } from "next";
import { ContenuExamensDisponiblesEglise } from "@/features/eglise/contenu-examens-disponibles-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Examens disponibles — Église",
  robots: { index: false, follow: false },
};

export default async function PageExamensDisponiblesEglise() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuExamensDisponiblesEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
