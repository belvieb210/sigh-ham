import type { Metadata } from "next";
import { ContenuConsultationMedecinsExternes } from "@/features/medecins-externes/contenu-consultation-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Consultation — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuConsultationMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
