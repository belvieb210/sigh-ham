import type { Metadata } from "next";
import { ContenuMessagerieClient } from "@/features/client/contenu-messagerie-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Messagerie — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  const props = propsUtilisateurClient(utilisateur);
  return (
    <ContenuMessagerieClient
      utilisateur={{ ...props, id: utilisateur.id }}
      estAdmin={
        utilisateur.role.code === "ADMIN" ||
        utilisateur.role.code === "SUPER_ADMIN"
      }
    />
  );
}
