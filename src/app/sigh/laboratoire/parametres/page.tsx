import type { Metadata } from "next";
import { ContenuPlaceholderLaboratoire } from "@/features/laboratoire/contenu-placeholder-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Paramètres — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageParametresLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();
  return (
    <ContenuPlaceholderLaboratoire
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
      titreKey="laboratoire.nav.parametres"
    />
  );
}
