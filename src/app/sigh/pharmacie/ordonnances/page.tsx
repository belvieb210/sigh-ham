import type { Metadata } from "next";
import { ContenuOrdonnancesPharmacie } from "@/features/pharmacie/contenu-ordonnances-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Ordonnances — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuOrdonnancesPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
    />
  );
}
