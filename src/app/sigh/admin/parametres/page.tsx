import type { Metadata } from "next";
import { ContenuParametresAdmin } from "@/features/admin/contenu-parametres-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Parametres — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuParametresAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
