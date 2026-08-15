"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CarrouselFondSectionHero } from "@/components/ui/carrousel-fond-section-hero";
import { IMAGE_HERO_SERVICES_LABORATOIRE } from "@/constants/images";
import { useContenuServicesLaboratoire } from "@/hooks/use-contenu-page";

const ICONES_GARANTIES = [ShieldCheck, FlaskConical, Zap, Lock] as const;

export function SectionHeroExamensLaboratoire() {
  const { hero } = useContenuServicesLaboratoire();
  const imagesFond =
    hero.imagesFond.length > 0
      ? hero.imagesFond
      : [
          {
            url: IMAGE_HERO_SERVICES_LABORATOIRE,
            alt: "Examens médicaux HAM Laboratoire",
          },
        ];

  return (
    <section
      className="section-hero-examens relative overflow-hidden"
      aria-labelledby="titre-examens-hero"
    >
      <CarrouselFondSectionHero
        images={imagesFond}
        gradientClassName="bg-gradient-to-r from-[#0f172a]/95 via-[#1a4d7c]/88 to-[#2d2a6e]/85"
        altFallback="Examens médicaux HAM Laboratoire"
      />

      <div className="conteneur-principal relative z-10 py-12 sm:py-14 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            <FlaskConical className="h-3.5 w-3.5" />
            {hero.surtitre}
          </p>

          <h1
            id="titre-examens-hero"
            className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.75rem]"
          >
            {hero.titre}{" "}
            <span className="text-[#7dd3fc]">{hero.titreAccent}</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {hero.description}
          </p>
        </motion.div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {hero.garanties.map((item, index) => {
            const Icone = ICONES_GARANTIES[index] ?? ShieldCheck;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#7dd3fc]">
                  <Icone className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{item.titre}</p>
                  <p className="mt-0.5 text-xs leading-snug text-white/65">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <a
          href="#catalogue-examens"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#7dd3fc] transition-colors hover:text-white"
        >
          Explorer le catalogue
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
