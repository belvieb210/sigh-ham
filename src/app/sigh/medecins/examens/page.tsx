import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuExamensMedecins } from "@/features/medecins/contenu-examens-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Examens — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageExamensMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <Suspense fallback={null}>
      <ContenuExamensMedecins
        utilisateur={propsUtilisateurMedecins(utilisateur)}
      />
    </Suspense>
  );
}
