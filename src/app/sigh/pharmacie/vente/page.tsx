import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuFacturationVentePharmacie } from "@/features/pharmacie/contenu-facturation-vente-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Vente — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <Suspense fallback={null}>
      <ContenuFacturationVentePharmacie
        utilisateur={propsUtilisateurPharmacie(utilisateur)}
      />
    </Suspense>
  );
}
