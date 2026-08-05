import type { Metadata } from "next";
import { ContenuAccueilClient } from "@/features/client/contenu-accueil-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuAccueilClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
