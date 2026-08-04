import type { Metadata } from "next";
import { ContenuNouveauMedecinsExternes } from "@/features/medecins-externes/contenu-nouveau-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Nouveau patient — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuNouveauMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
