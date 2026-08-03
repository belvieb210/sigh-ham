import type { Metadata } from "next";
import { ContenuAvoirsCaisse } from "@/features/caisse/contenu-avoirs-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Avoirs / Avances — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageAvoirsCaisse() {
  const utilisateur = await verifierAccesCaisse();
  return <ContenuAvoirsCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />;
}
