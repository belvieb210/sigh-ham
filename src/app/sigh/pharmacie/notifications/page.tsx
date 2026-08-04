import type { Metadata } from "next";
import { ContenuNotificationsPharmacie } from "@/features/pharmacie/contenu-notifications-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Notifications — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuNotificationsPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
