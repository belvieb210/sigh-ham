import type { Metadata } from "next";
import { ContenuHistoriqueInfirmiers } from "@/features/infirmiers/contenu-historique-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Historique — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageHistoriqueInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <ContenuHistoriqueInfirmiers
      utilisateur={propsUtilisateurInfirmiers(utilisateur)}
    />
  );
}
