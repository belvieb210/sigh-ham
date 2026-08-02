import type { Metadata } from "next";
import { ContenuNotificationsCaisse } from "@/features/caisse/contenu-notifications-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Notifications — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuNotificationsCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />
  );
}
