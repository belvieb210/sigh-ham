import type { Metadata } from "next";
import { ContenuExamensDisponiblesCaisse } from "@/features/caisse/contenu-examens-disponibles-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Examens disponibles — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageExamensDisponiblesCaisse() {
  const utilisateur = await verifierAccesCaisse();
  return (
    <ContenuExamensDisponiblesCaisse
      utilisateur={propsUtilisateurCaisse(utilisateur)}
    />
  );
}
