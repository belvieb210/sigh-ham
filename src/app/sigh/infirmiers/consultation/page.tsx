import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuConsultationInfirmiers } from "@/features/infirmiers/contenu-consultation-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Consultation — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageConsultationInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <Suspense fallback={null}>
      <ContenuConsultationInfirmiers
        utilisateur={propsUtilisateurInfirmiers(utilisateur)}
      />
    </Suspense>
  );
}
