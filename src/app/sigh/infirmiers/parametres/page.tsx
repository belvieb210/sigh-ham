import type { Metadata } from "next";
import { ContenuPlaceholderInfirmiers } from "@/features/infirmiers/contenu-placeholder-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Paramètres — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageParametresInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuPlaceholderInfirmiers
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
      titreKey="infirmiers.parametres.titre"
      sousTitreKey="infirmiers.parametres.description"
      messageKey="infirmiers.parametres.aVenir"
    />
  );
}
