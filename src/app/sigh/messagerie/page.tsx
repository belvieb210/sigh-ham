import type { Metadata } from "next";
import { ContenuMessagerieTransversal } from "@/features/messagerie/contenu-messagerie-transversal";
import { verifierAccesSigh } from "@/lib/auth/garde-sigh";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";
export const metadata: Metadata = {
  title: "Messagerie — SIGH",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieSigh() {
  const utilisateur = await verifierAccesSigh();

  return (
    <ContenuMessagerieTransversal
      utilisateur={{
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
        salle: utilisateur.role.salle?.nom ?? "SIGH",
      }}
      estAdmin={estRoleAdministrateur(utilisateur.role)}
    />
  );
}
