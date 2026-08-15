import type { Metadata } from "next";
import { ContenuPaquetsBilansAdmin } from "@/features/admin/contenu-paquets-bilans-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Paquets bilans — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuPaquetsBilansAdmin utilisateur={propsUtilisateurAdmin(utilisateur)} />
  );
}
