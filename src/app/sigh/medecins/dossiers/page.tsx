import type { Metadata } from "next";
import { ContenuDossiersMedecins } from "@/features/medecins/contenu-dossiers-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Dossiers patients — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageDossiersMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuDossiersMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
