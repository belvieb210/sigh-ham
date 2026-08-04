import type { Metadata } from "next";
import { ContenuExamensMedecinsExternes } from "@/features/medecins-externes/contenu-examens-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Examens — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuExamensMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
