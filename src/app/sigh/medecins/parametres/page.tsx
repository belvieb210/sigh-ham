import type { Metadata } from "next";
import { ContenuPlaceholderMedecins } from "@/features/medecins/contenu-placeholder-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Paramètres — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageParametresMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuPlaceholderMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
      titreKey="medecins.nav.parametres"
      descriptionKey="medecins.aVenir.description"
    />
  );
}
