import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Mon profil — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageProfilLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();

  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
      salle="laboratoire"
    />
  );
}
