import type { Metadata } from "next";
import { ContenuStockPharmacie } from "@/features/pharmacie/contenu-stock-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Achats — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuStockPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
      vue="achats"
    />
  );
}
