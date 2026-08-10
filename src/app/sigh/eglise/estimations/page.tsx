import type { Metadata } from "next";
import { ContenuEstimationsEglise } from "@/features/eglise/contenu-estimations-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Estimations — Service Conventionné",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuEstimationsEglise utilisateur={propsUtilisateurEglise(utilisateur)} />
  );
}
