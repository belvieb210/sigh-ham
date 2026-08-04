import type { Metadata } from "next";
import { ContenuAccueilInfirmiers } from "@/features/infirmiers/contenu-accueil-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Salle Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuAccueilInfirmiers
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
    />
  );
}
