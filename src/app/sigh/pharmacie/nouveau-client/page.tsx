import type { Metadata } from "next";
import { ContenuNouveauClientPharmacie } from "@/features/pharmacie/contenu-nouveau-client-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Nouveau client — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuNouveauClientPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
