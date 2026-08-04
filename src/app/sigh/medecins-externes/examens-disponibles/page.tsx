import type { Metadata } from "next";
import { ContenuPageMedecinsExternesAvenir } from "@/features/medecins-externes/contenu-page-avenir-me";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Examens disponibles — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuPageMedecinsExternesAvenir
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
      page="examensDisponibles"
    />
  );
}
