import type { Metadata } from "next";
import { ContenuRolesAdmin } from "@/features/admin/contenu-roles-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Roles — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuRolesAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
