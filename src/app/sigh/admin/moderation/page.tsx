import type { Metadata } from "next";
import { ContenuModerationAdmin } from "@/features/admin/contenu-moderation-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Modération messagerie — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuModerationAdmin utilisateur={propsUtilisateurAdmin(utilisateur)} />
  );
}
