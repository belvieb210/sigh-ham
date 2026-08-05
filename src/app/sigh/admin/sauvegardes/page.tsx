import type { Metadata } from "next";
import { ContenuSauvegardesAdmin } from "@/features/admin/contenu-sauvegardes-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Sauvegardes — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuSauvegardesAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
