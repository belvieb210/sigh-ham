import type { Metadata } from "next";
import { ContenuAccueilLaboratoire } from "@/features/laboratoire/contenu-accueil-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Salle Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();

  return (
    <ContenuAccueilLaboratoire
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
    />
  );
}
