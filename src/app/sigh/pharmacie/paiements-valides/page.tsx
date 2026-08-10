import type { Metadata } from "next";
import { ContenuPaiementsValidesPharmacie } from "@/features/pharmacie/contenu-paiements-valides-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Paiements validés — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuPaiementsValidesPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
