import { SectionHero } from "@/features/accueil/sections/section-hero";
import { SectionServices } from "@/features/accueil/sections/section-services";
import { SectionCampagnes } from "@/features/accueil/sections/section-campagnes";
import { SectionAccesRapide } from "@/features/accueil/sections/section-acces-rapide";
import { SectionApplicationMobile } from "@/features/accueil/sections/section-application-mobile";
import { obtenirDiapositivesHeroAccueil } from "@/services/service-hero-accueil";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Page d'accueil — hero DB + sections vitrine */
export default async function PageAccueil() {
  const diapositives = await obtenirDiapositivesHeroAccueil();

  return (
    <>
      <SectionHero diapositives={diapositives} />
      <SectionServices />
      <SectionCampagnes />
      <SectionAccesRapide />
      <SectionApplicationMobile />
    </>
  );
}
