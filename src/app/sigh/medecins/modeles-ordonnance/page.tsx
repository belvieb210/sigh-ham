import type { Metadata } from "next";
import { ContenuModelesOrdonnanceMedecins } from "@/features/medecins/contenu-modeles-ordonnance-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Modèles d'ordonnance — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageModelesOrdonnanceMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuModelesOrdonnanceMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
