import type { Metadata } from "next";
import { ContenuMessageriePharmacie } from "@/features/pharmacie/contenu-messagerie-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Messagerie — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function PageMessageriePharmacie() {
  const utilisateur = await verifierAccesPharmacie();
  const props = propsUtilisateurPharmacie(utilisateur);

  return (
    <ContenuMessageriePharmacie
      utilisateur={{ ...props, id: utilisateur.id }}
      estAdmin={
        utilisateur.role.code === "ADMIN" || utilisateur.role.code === "SUPER_ADMIN"
      }
    />
  );
}
