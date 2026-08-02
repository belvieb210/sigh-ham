import type { Metadata } from "next";
import { ContenuAccueilCaisse } from "@/features/caisse/contenu-accueil-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Salle Caisse",
  robots: { index: false, follow: false },
};

export default async function PageCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return <ContenuAccueilCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />;
}
