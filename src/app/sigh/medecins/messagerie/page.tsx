import type { Metadata } from "next";
import { ContenuMessagerieMedecins } from "@/features/medecins/contenu-messagerie-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";

export const metadata: Metadata = {
  title: "Messagerie — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuMessagerieMedecins
      utilisateur={{
        ...propsUtilisateurMedecins(utilisateur),
        id: utilisateur.id,
      }}
      estAdmin={estRoleAdministrateur(utilisateur.role)}
    />
  );
}
