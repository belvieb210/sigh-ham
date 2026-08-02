import type { Metadata } from "next";
import { ContenuNotificationsReception } from "@/features/notifications/contenu-notifications-reception";
import { verifierAccesReception } from "@/lib/auth/garde-salle";
import { propsUtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

export const metadata: Metadata = {
  title: "Notifications — Réception",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuNotificationsReception
      utilisateur={propsUtilisateurReception(utilisateur)}
    />
  );
}
