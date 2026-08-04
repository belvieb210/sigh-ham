import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuHospitalisationsMedecins } from "@/features/medecins/contenu-hospitalisations-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Hospitalisations — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageHospitalisationsMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <Suspense fallback={null}>
      <ContenuHospitalisationsMedecins
        utilisateur={propsUtilisateurMedecins(utilisateur)}
      />
    </Suspense>
  );
}
