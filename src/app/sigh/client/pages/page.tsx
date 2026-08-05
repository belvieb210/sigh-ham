import type { Metadata } from "next";
import { ContenuPagesClient } from "@/features/client/contenu-pages-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Pages — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuPagesClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
