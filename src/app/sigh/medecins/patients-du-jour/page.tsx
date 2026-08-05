import type { Metadata } from "next";
import { ContenuPatientsDuJourMedecins } from "@/features/medecins/contenu-patients-du-jour-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Patients du jour — Médecins",
  robots: { index: false, follow: false },
};

export default async function PagePatientsDuJourMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuPatientsDuJourMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
