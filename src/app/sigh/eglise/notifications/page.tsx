import type { Metadata } from "next";
import { ContenuNotificationsEglise } from "@/features/eglise/contenu-notifications-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Notifications — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  return (
    <ContenuNotificationsEglise
      utilisateur={propsUtilisateurEglise(utilisateur)}
    />
  );
}
