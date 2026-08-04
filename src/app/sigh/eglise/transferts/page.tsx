import type { Metadata } from "next";
import { ContenuPatientsTransferesEglise } from "@/features/eglise/contenu-listes-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Patients transférés — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuPatientsTransferesEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
