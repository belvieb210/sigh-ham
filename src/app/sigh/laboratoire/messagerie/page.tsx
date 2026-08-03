import type { Metadata } from "next";
import { ContenuMessagerieLaboratoire } from "@/features/laboratoire/contenu-messagerie-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";
import { estRoleAdministrateur } from "@/lib/auth/est-administrateur";

export const metadata: Metadata = {
  title: "Messagerie — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageMessagerieLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();

  return (
    <ContenuMessagerieLaboratoire
      utilisateur={{
        ...propsUtilisateurLaboratoire(utilisateur),
        id: utilisateur.id,
      }}
      estAdmin={estRoleAdministrateur(utilisateur.role)}
    />
  );
}
