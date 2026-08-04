import type { Metadata } from "next";
import { ContenuMessagerieInfirmiers } from "@/features/infirmiers/contenu-messagerie-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Messagerie — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();
  const props = propsUtilisateurInfirmiers(utilisateur);

  return (
    <ContenuMessagerieInfirmiers
      utilisateur={{ ...props, id: utilisateur.id }}
      estAdmin={utilisateur.role.code === "ADMIN" || utilisateur.role.code === "SUPER_ADMIN"}
    />
  );
}
