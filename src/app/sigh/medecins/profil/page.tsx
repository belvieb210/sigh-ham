import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Mon profil — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageProfilMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurMedecins(utilisateur)}
      salle="medecins"
    />
  );
}
