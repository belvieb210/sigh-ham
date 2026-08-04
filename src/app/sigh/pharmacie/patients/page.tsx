import type { Metadata } from "next";
import { ContenuPatientsPharmacie } from "@/features/pharmacie/contenu-patients-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Patients — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuPatientsPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
