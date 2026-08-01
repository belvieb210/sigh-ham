import type { Metadata } from "next";
import { ContenuNotificationsTransversal } from "@/features/notifications/contenu-notifications-transversal";
import { verifierAccesSigh } from "@/lib/auth/garde-sigh";

export const metadata: Metadata = {
  title: "Notifications — SIGH",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsSigh() {
  const utilisateur = await verifierAccesSigh();

  return (
    <ContenuNotificationsTransversal
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
        salle: utilisateur.role.salle?.nom ?? "SIGH",
      }}
    />
  );
}
