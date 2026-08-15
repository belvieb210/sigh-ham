"use client";

import { motion } from "framer-motion";
import { ChevronDown, FileText, ShieldCheck } from "lucide-react";
import { CarrouselFondSectionHero } from "@/components/ui/carrousel-fond-section-hero";
import { useContenuResultats } from "@/hooks/use-contenu-resultats";

const IMAGE_HERO =
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80";

export function SectionHeroResultats() {
  const { hero } = useContenuResultats();
  const imagesFond = [{ url: IMAGE_HERO, alt: "Résultats HAM Laboratoire" }];

  const stats = [
    { label: hero.stats.securise, valeur: "SSL" },
    { label: hero.stats.disponible, valeur: "24h/24" },
    { label: hero.stats.certifie, valeur: "ISO" },
    { label: hero.stats.rapide, valeur: "PDF" },
  ];

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="titre-resultats-hero"
    >
      <CarrouselFondSectionHero
        images={imagesFond}
        gradientClassName="bg-gradient-to-r from-[#0f172a]/95 via-[#1a4d7c]/90 to-[#2d2a6e]/85"
        altFallback="Résultats HAM Laboratoire"
      />

      <div className="conteneur-principal relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <FileText className="h-3.5 w-3.5" />
              {hero.surtitre}
            </div>

            <h1
              id="titre-resultats-hero"
              className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.85rem]"
            >
              {hero.titre}{" "}
              <span className="text-[#7dd3fc]">{hero.titreAccent}</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm"
                >
                  <p className="text-lg font-bold text-[#7dd3fc]">{s.valeur}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="#consultation-resultats"
              className="mt-10 inline-flex flex-col items-center gap-1 text-xs font-medium text-white/60 transition-colors hover:text-white"
            >
              <ShieldCheck className="h-5 w-5" />
              Accéder au portail
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
