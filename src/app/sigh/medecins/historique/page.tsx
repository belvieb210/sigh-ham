import type { Metadata } from "next";
import { ContenuHistoriqueMedecins } from "@/features/medecins/contenu-historique-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Historique — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageHistoriqueMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuHistoriqueMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
