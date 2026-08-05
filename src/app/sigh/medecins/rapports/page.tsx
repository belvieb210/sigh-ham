import type { Metadata } from "next";
import { ContenuRapportsMedecins } from "@/features/medecins/contenu-rapports-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Rapports — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageRapportsMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuRapportsMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
