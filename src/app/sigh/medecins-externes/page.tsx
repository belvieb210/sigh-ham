import type { Metadata } from "next";
import { ContenuAccueilMedecinsExternes } from "@/features/medecins-externes/contenu-accueil-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuAccueilMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
