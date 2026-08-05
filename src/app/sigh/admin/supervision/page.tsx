import type { Metadata } from "next";
import { ContenuSupervisionAdmin } from "@/features/admin/contenu-supervision-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Supervision — Administration",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesAdmin();
  return (
    <ContenuSupervisionAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
    />
  );
}
