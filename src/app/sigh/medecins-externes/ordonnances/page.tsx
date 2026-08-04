import type { Metadata } from "next";
import { ContenuOrdonnancesMedecinsExternes } from "@/features/medecins-externes/contenu-ordonnances-medecins-externes";
import { verifierAccesMedecinsExternes } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecinsExternes } from "@/lib/auth/props-utilisateur-medecins-externes";

export const metadata: Metadata = {
  title: "Ordonnances — Médecins externes",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesMedecinsExternes();
  return (
    <ContenuOrdonnancesMedecinsExternes
      utilisateur={propsUtilisateurMedecinsExternes(utilisateur)}
    />
  );
}
