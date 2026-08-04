import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuConstantesInfirmiers } from "@/features/infirmiers/contenu-constantes-infirmiers";
import { verifierAccesInfirmiers } from "@/lib/auth/garde-salle";
import { propsUtilisateurInfirmiers } from "@/lib/auth/props-utilisateur-infirmiers";

export const metadata: Metadata = {
  title: "Constantes — Infirmiers",
  robots: { index: false, follow: false },
};

export default async function PageConstantesInfirmiers() {
  const utilisateur = await verifierAccesInfirmiers();
  const props = propsUtilisateurInfirmiers(utilisateur);

  return (
    <Suspense fallback={null}>
      <ContenuConstantesInfirmiers utilisateur={props} />
    </Suspense>
  );
}
