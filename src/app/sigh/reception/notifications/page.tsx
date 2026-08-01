import type { Metadata } from "next";
import { ContenuNotificationsReception } from "@/features/notifications/contenu-notifications-reception";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Notifications — Réception",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuNotificationsReception
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
    />
  );
}
