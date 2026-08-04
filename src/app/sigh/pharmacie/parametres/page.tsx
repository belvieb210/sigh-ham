import type { Metadata } from "next";
import { ContenuPlaceholderPharmacie } from "@/features/pharmacie/contenu-placeholder-pharmacie";
import { verifierAccesPharmacie } from "@/lib/auth/garde-salle";
import { propsUtilisateurPharmacie } from "@/lib/auth/props-utilisateur-pharmacie";

export const metadata: Metadata = {
  title: "Paramètres — Pharmacie",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesPharmacie();

  return (
    <ContenuPlaceholderPharmacie
      utilisateur={propsUtilisateurPharmacie(utilisateur)}
      titreKey="pharmacie.parametres.titre" sousTitreKey="pharmacie.parametres.description" messageKey="pharmacie.parametres.aVenir"
    />
  );
}
