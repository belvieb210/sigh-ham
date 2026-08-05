import type { Metadata } from "next";
import { ContenuHeroClient } from "@/features/client/contenu-hero-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Hero — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuHeroClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
