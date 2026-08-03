import type { Metadata } from "next";
import { ContenuNotificationsLaboratoire } from "@/features/laboratoire/contenu-notifications-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Notifications — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageNotificationsLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();

  return (
    <ContenuNotificationsLaboratoire
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
    />
  );
}
