import type { Metadata } from "next";
import { ContenuServicesAdmin } from "@/features/admin/contenu-services-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Services — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuServicesAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
