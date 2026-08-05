import type { Metadata } from "next";
import { ContenuNotificationsClient } from "@/features/client/contenu-notifications-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Notifications — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuNotificationsClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
