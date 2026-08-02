import type { Metadata } from "next";
import { ContenuFacturesJourCaisse } from "@/features/caisse/contenu-factures-jour-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Factures du jour — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageFacturesCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return <ContenuFacturesJourCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />;
}
