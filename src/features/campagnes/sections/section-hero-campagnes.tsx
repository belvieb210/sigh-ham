"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Megaphone } from "lucide-react";
import { IMAGE_HERO_CAMPAGNES } from "@/constants/images";
import { CarrouselFondSectionHero } from "@/components/ui/carrousel-fond-section-hero";
import { useCampagnes } from "@/hooks/use-campagnes";
import { Bouton } from "@/components/ui/bouton";
import { useContenuCampagnes } from "@/hooks/use-contenu-page";

export function SectionHeroCampagnes() {
  const { hero } = useContenuCampagnes();
  const { data: campagnes = [] } = useCampagnes();
  const enCours = campagnes.filter((c) => c.statut === "en_cours").length;

  const statistiques = hero.statistiques;
  const imagesFond =
    hero.imagesFond.length > 0
      ? hero.imagesFond
      : [{ url: IMAGE_HERO_CAMPAGNES, alt: "Campagnes HAM Laboratoire" }];

  return (
    <section
      className="section-hero-campagnes relative overflow-hidden"
      aria-labelledby="titre-campagnes-hero"
    >
      <CarrouselFondSectionHero
        images={imagesFond}
        gradientClassName="bg-gradient-to-r from-[#0f172a]/95 via-[#2d2a6e]/88 to-[#7a1f4e]/75"
        altFallback="Campagnes HAM Laboratoire"
      />

      <div className="conteneur-principal relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <Megaphone className="h-3.5 w-3.5" />
              {hero.surtitre}
            </div>

            <h1
              id="titre-campagnes-hero"
              className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.85rem]"
            >
              {hero.titre}{" "}
              <span className="text-[#f9a8d4]">{hero.titreAccent}</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#campagnes-vedette">
                <Bouton
                  taille="grand"
                  className="w-full bg-white text-[#7a1f4e] hover:bg-white/90 sm:w-auto"
                  enTantQueEnfant
                >
                  Voir les campagnes en cours
                  <ArrowRight className="h-4 w-4" />
                </Bouton>
              </a>
              <a
                href="#toutes-campagnes"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Toutes les publications
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-6 text-sm text-white/60">
              <span className="font-semibold text-white">{enCours}</span> campagne
              {enCours > 1 ? "s" : ""} en cours ·{" "}
              <span className="font-semibold text-white">{campagnes.length}</span>{" "}
              publications officielles
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {statistiques.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:p-6"
              >
                <p className="text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.valeur}
                </p>
                <p className="mt-1.5 text-xs font-medium leading-snug text-white/70 sm:text-sm">
                  {stat.libelle}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
