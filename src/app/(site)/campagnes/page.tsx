import type { Metadata } from "next";
import { SectionHeroCampagnes } from "@/features/campagnes/sections/section-hero-campagnes";
import { SectionVedetteCampagnes } from "@/features/campagnes/sections/section-vedette-campagnes";
import { SectionImpactCampagnes } from "@/features/campagnes/sections/section-impact-campagnes";
import { SectionParcoursCampagnes } from "@/features/campagnes/sections/section-parcours-campagnes";
import { SectionGrilleCampagnes } from "@/features/campagnes/sections/section-grille-campagnes";
import { SectionCtaCampagnes } from "@/features/campagnes/sections/section-cta-campagnes";

export const metadata: Metadata = {
  title: "Campagnes & publicités",
  description:
    "Campagnes de santé, dépistages, vaccinations et publicités de HAM LABORATOIRE à Kinshasa. Toutes nos actions de prévention et sensibilisation.",
  openGraph: {
    title: "Campagnes | HAM Laboratoire",
    description:
      "Découvrez nos campagnes de dépistage, vaccinations et actions de santé publique.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PageCampagnes() {
  return (
    <>
      <SectionHeroCampagnes />
      <SectionVedetteCampagnes />
      <SectionImpactCampagnes />
      <SectionParcoursCampagnes />
      <SectionGrilleCampagnes />
      <SectionCtaCampagnes />
    </>
  );
}
