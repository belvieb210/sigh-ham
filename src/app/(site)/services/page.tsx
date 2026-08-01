import type { Metadata } from "next";
import { SectionHeroServices } from "@/features/services/sections/section-hero-services";
import { SectionVedetteServices } from "@/features/services/sections/section-vedette-services";
import { SectionGrilleServices } from "@/features/services/sections/section-grille-services";
import { SectionSpecialitesAnalyses } from "@/features/services/sections/section-specialites-analyses";
import { SectionImpactServices } from "@/features/services/sections/section-impact-services";
import { SectionParcoursPatient } from "@/features/services/sections/section-parcours-patient";
import { SectionEngagementsQualite } from "@/features/services/sections/section-engagements-qualite";
import { SectionCtaServices } from "@/features/services/sections/section-cta-services";

export const metadata: Metadata = {
  title: "Nos services",
  description:
    "Découvrez les services de HAM LABORATOIRE — analyses médicales, consultations, imagerie, pharmacie et plus. Fiabilité, rapidité et accessibilité à Kinshasa.",
  openGraph: {
    title: "Nos services | HAM Laboratoire",
    description:
      "Excellence en diagnostic médical — laboratoire, consultations, imagerie et dépistages.",
  },
};

export default function PageServices() {
  return (
    <>
      <SectionHeroServices />
      <SectionVedetteServices />
      <SectionGrilleServices />
      <SectionSpecialitesAnalyses />
      <SectionImpactServices />
      <SectionParcoursPatient />
      <SectionEngagementsQualite />
      <SectionCtaServices />
    </>
  );
}
