import type { Metadata } from "next";
import { ContenuEncaissementsCaisse } from "@/features/caisse/contenu-encaissements-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Encaissements — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageEncaissementsCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuEncaissementsCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />
  );
}
