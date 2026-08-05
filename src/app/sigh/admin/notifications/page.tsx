import type { Metadata } from "next";
import { ContenuNotificationsAdmin } from "@/features/admin/contenu-notifications-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Notifications — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuNotificationsAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
