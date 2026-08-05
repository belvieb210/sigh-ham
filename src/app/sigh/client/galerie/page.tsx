import type { Metadata } from "next";
import { ContenuGalerieClient } from "@/features/client/contenu-galerie-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Galerie — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuGalerieClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
