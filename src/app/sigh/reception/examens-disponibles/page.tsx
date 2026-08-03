import type { Metadata } from "next";
import { ContenuPageReceptionAvenir } from "@/features/reception/contenu-page-reception-avenir";
import { verifierAccesReception } from "@/lib/auth/garde-salle";
import { propsUtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

export const metadata: Metadata = {
  title: "Examens disponibles — Réception",
  robots: { index: false, follow: false },
};

export default async function PageExamensDisponiblesReception() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuPageReceptionAvenir
      page="examensDisponibles"
      utilisateur={propsUtilisateurReception(utilisateur)}
    />
  );
}
