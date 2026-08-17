import type { Metadata } from "next";
import { ContenuSecuriteAdmin } from "@/features/admin/contenu-securite-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Securite — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuSecuriteAdmin utilisateur={propsUtilisateurAdmin(utilisateur)} />
  );
}
