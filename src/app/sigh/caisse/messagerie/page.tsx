import type { Metadata } from "next";
import { ContenuMessagerieCaisse } from "@/features/caisse/contenu-messagerie-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";

export const metadata: Metadata = {
  title: "Messagerie — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuMessagerieCaisse
      utilisateur={{
        ...propsUtilisateurCaisse(utilisateur),
        id: utilisateur.id,
      }}
      estAdmin={estRoleAdministrateur(utilisateur.role)}
    />
  );
}
