import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Mon profil — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageProfilCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuProfilUtilisateur
      utilisateur={propsUtilisateurCaisse(utilisateur)}
      salle="caisse"
    />
  );
}
