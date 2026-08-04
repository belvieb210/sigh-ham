import type { Metadata } from "next";
import { ContenuRdvMedecins } from "@/features/medecins/contenu-rdv-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Rendez-vous — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageRendezVousMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <ContenuRdvMedecins utilisateur={propsUtilisateurMedecins(utilisateur)} />
  );
}
