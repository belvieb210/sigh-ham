import type { Metadata } from "next";
import { ContenuPageReceptionAvenir } from "@/features/reception/contenu-page-reception-avenir";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Historique — Réception",
  robots: { index: false, follow: false },
};

export default async function PageHistoriqueReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuPageReceptionAvenir
      page="historique"
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
    />
  );
}
