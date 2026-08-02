import type { Metadata } from "next";
import { ContenuProfilUtilisateur } from "@/features/reception/contenu-profil-utilisateur";
import { verifierAccesReception } from "@/lib/auth/garde-salle";
import { propsUtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

export const metadata: Metadata = {
  title: "Mon profil — Réception",
  robots: { index: false, follow: false },
};

export default async function PageProfilReception() {
  const utilisateur = await verifierAccesReception();

  return <ContenuProfilUtilisateur utilisateur={propsUtilisateurReception(utilisateur)} />;
}
