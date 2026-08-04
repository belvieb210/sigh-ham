import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Mon profil — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageProfilInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
      salle="infirmiers"
    />
  );
}
