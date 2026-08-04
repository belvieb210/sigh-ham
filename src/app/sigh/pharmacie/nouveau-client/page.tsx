import type { Metadata } from "next";
import { ContenuVentePharmacie } from "@/features/pharmacie/contenu-vente-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Nouveau client — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuVentePharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
      mode="nouveau"
    />
  );
}
