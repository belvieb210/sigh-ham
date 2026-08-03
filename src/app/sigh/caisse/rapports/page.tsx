import type { Metadata } from "next";
import { ContenuRapportJournalierCaisse } from "@/features/caisse/contenu-rapport-journalier-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Rapport journalier — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageRapportJournalierCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuRapportJournalierCaisse
      utilisateur={propsUtilisateurCaisse(utilisateur)}
    />
  );
}
