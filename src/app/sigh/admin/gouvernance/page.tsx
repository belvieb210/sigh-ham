import type { Metadata } from "next";
import { ContenuGouvernanceAdmin } from "@/features/admin/contenu-gouvernance-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Gouvernance - Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuGouvernanceAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
