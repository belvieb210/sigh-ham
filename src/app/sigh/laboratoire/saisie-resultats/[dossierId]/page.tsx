import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ContenuSaisieResultatsLaboratoire } from "@/features/laboratoire/contenu-saisie-resultats-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Saisie des résultats — Laboratoire",
  robots: { index: false, follow: false },
};

interface PropsPage {
  params: Promise<{ dossierId: string }>;
}

export default async function PageSaisieResultatsDossierLaboratoire({
  params,
}: PropsPage) {
  const utilisateur = await verifierAccesLaboratoire();
  const { dossierId } = await params;

  if (!dossierId?.trim()) notFound();

  return (
    <Suspense fallback={null}>
      <ContenuSaisieResultatsLaboratoire
        utilisateur={propsUtilisateurLaboratoire(utilisateur)}
        dossierId={dossierId.trim()}
      />
    </Suspense>
  );
}
