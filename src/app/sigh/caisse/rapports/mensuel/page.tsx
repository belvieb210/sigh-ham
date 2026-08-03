import type { Metadata } from "next";
import { ContenuRapportMensuelCaisse } from "@/features/caisse/contenu-rapport-mensuel-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Rapport mensuel — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageRapportMensuelCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuRapportMensuelCaisse
      utilisateur={propsUtilisateurCaisse(utilisateur)}
    />
  );
}
