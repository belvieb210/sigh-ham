import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuNotesMedecins } from "@/features/medecins/contenu-notes-medecins";
import { verifierAccesMedecins } from "@/lib/auth/garde-salle";
import { propsUtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";

export const metadata: Metadata = {
  title: "Notes médicales — Médecins",
  robots: { index: false, follow: false },
};

export default async function PageNotesMedecins() {
  const utilisateur = await verifierAccesMedecins();

  return (
    <Suspense fallback={null}>
      <ContenuNotesMedecins
        utilisateur={propsUtilisateurMedecins(utilisateur)}
      />
    </Suspense>
  );
}
