import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuExamensEnCoursLaboratoire } from "@/features/laboratoire/contenu-examens-en-cours-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Examens en cours — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PageExamensEnCoursLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();
  return (
    <Suspense fallback={null}>
      <ContenuExamensEnCoursLaboratoire
        utilisateur={propsUtilisateurLaboratoire(utilisateur)}
      />
    </Suspense>
  );
}
