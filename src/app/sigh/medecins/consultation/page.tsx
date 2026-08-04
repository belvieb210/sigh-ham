import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuConsultationMedecins } from "@/features/medecins/contenu-consultation-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Consultation — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageConsultationMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <Suspense fallback={null}>
      <ContenuConsultationMedecins
        utilisateur={propsUtilisateurMedecins(utilisateur)}
      />
    </Suspense>
  );
}
