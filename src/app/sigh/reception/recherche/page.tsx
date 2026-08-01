import type { Metadata } from "next";
import { ContenuPageReceptionAvenir } from "@/features/reception/contenu-page-reception-avenir";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Rechercher patient — Réception",
  robots: { index: false, follow: false },
};

export default async function PageRecherchePatient() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuPageReceptionAvenir
      page="recherche"
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
    />
  );
}
