import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuOrdonnancesMedecins } from "@/features/medecins/contenu-ordonnances-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Ordonnances — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageOrdonnancesMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <Suspense fallback={null}>
      <ContenuOrdonnancesMedecins
        utilisateur={propsUtilisateurMedecins(utilisateur)}
      />
    </Suspense>
  );
}
