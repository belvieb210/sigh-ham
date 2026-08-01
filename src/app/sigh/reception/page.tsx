import type { Metadata } from "next";
import { ContenuReception } from "@/features/reception/contenu-reception";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Salle de Réception",
  robots: { index: false, follow: false },
};

export default async function PageReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuReception
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
    />
  );
}
