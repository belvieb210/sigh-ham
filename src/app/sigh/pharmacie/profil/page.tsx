import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Mon profil — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function PageProfilPharmacie() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
      salle="pharmacie"
    />
  );
}
