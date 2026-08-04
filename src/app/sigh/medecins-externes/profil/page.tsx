import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Mon profil — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
      salle="medecins-externes"
    />
  );
}
