import type { Metadata } from "next";
import { ContenuPatientsMedecins } from "@/features/medecins/contenu-patients-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Patients — Médecins",
  robots: { index: false, follow: false },
};

export default async function PagePatientsMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuPatientsMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
