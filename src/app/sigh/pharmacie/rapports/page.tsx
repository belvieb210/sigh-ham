import type { Metadata } from "next";
import { ContenuRapportsPharmacie } from "@/features/pharmacie/contenu-rapports-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Rapports — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuRapportsPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
