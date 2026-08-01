import { SectionHero } from "@/features/accueil/sections/section-hero";
import { SectionServices } from "@/features/accueil/sections/section-services";
import { SectionCampagnes } from "@/features/accueil/sections/section-campagnes";
import { SectionAccesRapide } from "@/features/accueil/sections/section-acces-rapide";
import { SectionApplicationMobile } from "@/features/accueil/sections/section-application-mobile";

/** Page d'accueil — sections conformes à la maquette (image 2) */
export default function PageAccueil() {
  return (
    <>
      <SectionHero />
      <SectionServices />
      <SectionCampagnes />
      <SectionAccesRapide />
      <SectionApplicationMobile />
    </>
  );
}
