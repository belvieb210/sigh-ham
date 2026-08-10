import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuFicheTraitementInfirmiers } from "@/features/infirmiers/contenu-fiche-traitement-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Fiche de traitement — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageFicheTraitementInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();

  return (
    <Suspense fallback={null}>
      <ContenuFicheTraitementInfirmiers
        utilisateur={propsUtilisateurInfirmiers(utilisateur)}
      />
    </Suspense>
  );
}
