import type { Metadata } from "next";
import { ContenuPlaceholderMedecinsExternes } from "@/features/medecins-externes/contenu-placeholder-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Paramètres — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuPlaceholderMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
      titreKey="medecinsExternes.parametres.titre"
      sousTitreKey="medecinsExternes.parametres.description"
      messageKey="medecinsExternes.parametres.aVenir"
    />
  );
}
