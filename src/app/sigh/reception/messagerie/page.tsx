import type { Metadata } from "next";
import { ContenuMessagerieReception } from "@/features/messagerie/contenu-messagerie-reception";
import { verifierAccesReception } from "@/lib/auth/garde-salle";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";

export const metadata: Metadata = {
  title: "Messagerie — Réception",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuMessagerieReception
      utilisateur={{
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
      estAdmin={estRoleAdministrateur(utilisateur.role)}
    />
  );
}
