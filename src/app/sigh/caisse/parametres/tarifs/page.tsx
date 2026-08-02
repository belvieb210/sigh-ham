import type { Metadata } from "next";
import { ContenuPlaceholderCaisse } from "@/features/caisse/contenu-placeholder-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Tarifs — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageTarifsCaisse() {
  const utilisateur = await verifierAccesCaisse();
  return (
    <ContenuPlaceholderCaisse
      utilisateur={propsUtilisateurCaisse(utilisateur)}
      titreKey="caisse.nav.tarifs"
    />
  );
}
