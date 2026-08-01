import { Suspense } from "react";
import type { Metadata } from "next";
import { ContenuNouveauPatient } from "@/features/reception/contenu-nouveau-patient";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Nouveau patient — Réception",
  robots: { index: false, follow: false },
};

export default async function PageNouveauPatient() {
  const utilisateur = await verifierAccesReception();

  return (
    <Suspense fallback={null}>
      <ContenuNouveauPatient
        utilisateur={{
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          role: utilisateur.role.nom,
        }}
      />
    </Suspense>
  );
}
