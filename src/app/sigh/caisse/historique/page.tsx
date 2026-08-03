import type { Metadata } from "next";
import { ContenuHistoriqueCaisse } from "@/features/caisse/contenu-historique-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Historique caisse — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageHistoriqueCaisse() {
  const utilisateur = await verifierAccesCaisse();
  return <ContenuHistoriqueCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />;
}
