import type { Metadata } from "next";
import { ContenuAccueilAdmin } from "@/features/admin/contenu-accueil-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuAccueilAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
