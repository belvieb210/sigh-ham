import type { Metadata } from "next";
import { ContenuNotificationsInfirmiers } from "@/features/infirmiers/contenu-notifications-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Notifications — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuNotificationsInfirmiers
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
    />
  );
}
