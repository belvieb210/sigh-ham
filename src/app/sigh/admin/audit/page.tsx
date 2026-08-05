import type { Metadata } from "next";
import { ContenuAuditAdmin } from "@/features/admin/contenu-audit-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Journal d'audit — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuAuditAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
