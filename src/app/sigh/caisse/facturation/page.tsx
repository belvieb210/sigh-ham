import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuFacturationCaisse } from "@/features/caisse/contenu-facturation-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Facturation — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageFacturationCaisse() {
  const utilisateur = await verifierAccesCaisse();
  const props = propsUtilisateurCaisse(utilisateur);

  return (
    <Suspense fallback={null}>
      <ContenuFacturationCaisse utilisateur={props} />
    </Suspense>
  );
}
