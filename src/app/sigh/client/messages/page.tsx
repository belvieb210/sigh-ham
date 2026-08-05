import type { Metadata } from "next";
import { ContenuMessagesClient } from "@/features/client/contenu-messages-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Messages — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuMessagesClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
