import type { Metadata } from "next";
import { ContenuAccueilPharmacie } from "@/features/pharmacie/contenu-accueil-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Accueil — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuAccueilPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
