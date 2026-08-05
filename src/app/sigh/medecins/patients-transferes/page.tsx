import type { Metadata } from "next";
import { ContenuPatientsTransferesMedecins } from "@/features/medecins/contenu-patients-transferes-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Patients transférés — Médecins",
  robots: { index: false, follow: false },
};

export default async function PagePatientsTransferesMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuPatientsTransferesMedecins
      utilisateur={propsUtilisateurMedecins(utilisateur)}
    />
  );
}
