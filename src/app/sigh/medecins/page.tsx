import type { Metadata } from "next";
import { ContenuAccueilMedecins } from "@/features/medecins/contenu-accueil-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Salle Médecins",
  robots: { index: false, follow: false },
};

export default async function PageMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuAccueilMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
