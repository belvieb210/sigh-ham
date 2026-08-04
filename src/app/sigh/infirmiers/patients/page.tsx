import type { Metadata } from "next";
import { ContenuPatientsInfirmiers } from "@/features/infirmiers/contenu-patients-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Patients — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PagePatientsInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuPatientsInfirmiers
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
    />
  );
}
