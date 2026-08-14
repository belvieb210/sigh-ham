"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Phone,
} from "lucide-react";
import { IMAGE_HERO_RENDEZ_VOUS } from "@/constants/images";
import { CarrouselFondSectionHero } from "@/components/ui/carrousel-fond-section-hero";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { Bouton } from "@/components/ui/bouton";
import { useContenuRendezVous } from "@/hooks/use-contenu-page";

export function SectionHeroRendezVous() {
  const { hero } = useContenuRendezVous();
  const imagesFond =
    hero.imagesFond.length > 0
      ? hero.imagesFond
      : [{ url: IMAGE_HERO_RENDEZ_VOUS, alt: "Rendez-vous HAM Laboratoire" }];

  return (
    <section
      className="section-hero-rendez-vous relative overflow-hidden"
      aria-labelledby="titre-rdv-hero"
    >
      <CarrouselFondSectionHero
        images={imagesFond}
        gradientClassName="bg-gradient-to-r from-[#0f172a]/95 via-[#1a4d7c]/90 to-[#2d2a6e]/85"
        altFallback="Rendez-vous HAM Laboratoire"
      />

      <div className="conteneur-principal relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5" />
              {hero.surtitre}
            </div>

            <h1
              id="titre-rdv-hero"
              className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.85rem]"
            >
              {hero.titre}{" "}
              <span className="text-[#7dd3fc]">{hero.titreAccent}</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#reservation">
                <Bouton
                  taille="grand"
                  className="w-full bg-white text-bleu-medical hover:bg-white/90 sm:w-auto"
                  enTantQueEnfant
                >
                  Commencer la réservation
                  <ArrowRight className="h-4 w-4" />
                </Bouton>
              </a>
              <a
                href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone className="h-4 w-4" />
                {INFORMATIONS_HOPITAL.telephone}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {hero.statistiques.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:p-6"
              >
                <p className="text-xl font-extrabold text-white sm:text-2xl">
                  {stat.valeur}
                </p>
                <p className="mt-1.5 text-xs font-medium leading-snug text-white/70 sm:text-sm">
                  {stat.libelle}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-10 flex justify-center lg:mt-12">
          <a
            href="#reservation"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 transition-colors hover:text-white"
          >
            Accéder au formulaire
            <ChevronDown className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
