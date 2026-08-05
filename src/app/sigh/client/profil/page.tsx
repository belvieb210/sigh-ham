import type { Metadata } from "next";
import { ContenuProfilClient } from "@/features/client/contenu-profil-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Mon profil — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuProfilClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
