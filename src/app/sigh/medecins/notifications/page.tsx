import type { Metadata } from "next";
import { ContenuNotificationsMedecins } from "@/features/medecins/contenu-notifications-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Notifications — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuNotificationsMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
