import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuPatientsLaboratoire } from "@/features/laboratoire/contenu-patients-laboratoire";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Patients transférés — Laboratoire",
  robots: { index: false, follow: false },
};

export default async function PagePatientsLaboratoire() {
  const utilisateur = await verifierAccesLaboratoire();
  const props = propsUtilisateurLaboratoire(utilisateur);

  return (
    <Suspense fallback={null}>
      <ContenuPatientsLaboratoire utilisateur={props} />
    </Suspense>
  );
}
