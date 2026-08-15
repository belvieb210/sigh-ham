import type { Metadata } from "next";
import { SectionConsultationResultats } from "@/features/resultats/sections/section-consultation-resultats";

export const metadata: Metadata = {
  title: "Résultats d'examens",
  description:
    "Consultez vos résultats d'analyses médicales approuvés en ligne — HAM LABORATOIRE, Kinshasa. Accès sécurisé avec votre numéro patient et numéro de facture.",
  openGraph: {
    title: "Résultats d'examens | HAM Laboratoire",
    description:
      "Portail patient sécurisé pour consulter et télécharger vos rapports d'analyses approuvés.",
  },
};

export default function PageResultats() {
  return <SectionConsultationResultats />;
}
