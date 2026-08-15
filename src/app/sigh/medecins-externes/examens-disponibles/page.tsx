import type { Metadata } from "next";
import { ContenuExamensDisponiblesMedecinsExternes } from "@/features/medecins-externes/contenu-examens-disponibles-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Examens disponibles — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function PageExamensDisponiblesMedecinsExternes() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuExamensDisponiblesMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
