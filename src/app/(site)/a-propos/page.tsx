import type { Metadata } from "next";
import { SectionHeroAPropos } from "@/features/a-propos/sections/section-hero-a-propos";
import { SectionMissionVision } from "@/features/a-propos/sections/section-mission-vision";
import { SectionImpactAPropos } from "@/features/a-propos/sections/section-impact-a-propos";
import { SectionDirectionEquipe } from "@/features/a-propos/sections/section-direction-equipe";
import { SectionCertificationsBandeau } from "@/features/a-propos/sections/section-certifications-bandeau";
import { SectionCtaAPropos } from "@/features/a-propos/sections/section-cta-a-propos";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez HAM LABORATOIRE — Centre de Diagnostic et d'Analyses Médicales à Kinshasa. Mission, équipe, valeurs et engagements.",
  openGraph: {
    title: "À propos | HAM Laboratoire",
    description:
      "VOTRE SANTÉ MON FARDEAU, LA FIABILITÉ NOTRE PRÉÉMINENCE.",
  },
};

export default function PageAPropos() {
  return (
    <>
      <SectionHeroAPropos />
      <SectionMissionVision />
      <SectionImpactAPropos />
      <SectionDirectionEquipe />
      <SectionCertificationsBandeau />
      <SectionCtaAPropos />
    </>
  );
}
