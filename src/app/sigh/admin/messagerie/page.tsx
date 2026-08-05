import type { Metadata } from "next";
import { ContenuMessagerieAdmin } from "@/features/admin/contenu-messagerie-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Messagerie — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  const props = propsUtilisateurAdmin(utilisateur);
  return (
    <ContenuMessagerieAdmin
      utilisateur={props}
      utilisateurId={utilisateur.id}
      estAdmin
    />
  );
}
