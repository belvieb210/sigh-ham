import type { Metadata } from "next";
import { ContenuPlaceholderLaboratoire } from "@/features/laboratoire/contenu-placeholder-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Saisie des résultats — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageSaisieResultatsLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();
  return (
    <ContenuPlaceholderLaboratoire
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
      titreKey="laboratoire.nav.saisieResultats"
    />
  );
}
