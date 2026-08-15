import type { Metadata } from "next";
import { SectionHeroExamensLaboratoire } from "@/features/services-laboratoire/section-hero-examens-laboratoire";
import { CatalogueExamensLaboratoire } from "@/features/services-laboratoire/catalogue-examens-laboratoire";
import { SectionCtaExamensLaboratoire } from "@/features/services-laboratoire/section-cta-examens-laboratoire";

export const metadata: Metadata = {
  title: "Examens médicaux — Laboratoire",
  description:
    "Catalogue complet des examens de laboratoire HAM LABORATOIRE — tarifs, délais et prise de rendez-vous à Kinshasa.",
  openGraph: {
    title: "Nos examens médicaux | HAM Laboratoire",
    description:
      "Analyses biologiques, hématologie, biochimie, sérologie et plus — résultats fiables et tarifs transparents.",
  },
};

export default function PageServicesLaboratoire() {
  return (
    <>
      <SectionHeroExamensLaboratoire />
      <CatalogueExamensLaboratoire />
      <SectionCtaExamensLaboratoire />
    </>
  );
}
