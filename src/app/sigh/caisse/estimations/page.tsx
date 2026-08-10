import type { Metadata } from "next";
import { ContenuEstimationsCaisse } from "@/features/caisse/contenu-estimations-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Estimations — Caisse",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesCaisse();
  return (
    <ContenuEstimationsCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />
  );
}
