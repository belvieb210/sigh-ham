"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { CHEMIN_LOGO_HAM } from "@/constants/navigation";
import { useContenuAPropos } from "@/hooks/use-contenu-page";
import { cn } from "@/lib/utils";

const INTERVALLE_HERO_MS = 5500;
const DELAI_REPRISE_MS = 7000;

export function SectionHeroAPropos() {
  const { hero } = useContenuAPropos();
  const images = hero.imagesFond?.length
    ? hero.imagesFond
    : [{ url: "/images/a-propos/labo-1.jpg", alt: "HAM Laboratoire" }];

  const [indexActif, setIndexActif] = useState(0);
  const [progression, setProgression] = useState(0);
  const refPause = useRef(false);

  const allerA = useCallback(
    (index: number) => {
      setIndexActif((index + images.length) % images.length);
      setProgression(0);
    },
    [images.length]
  );

  const imageSuivante = useCallback(() => {
    setIndexActif((i) => (i + 1) % images.length);
    setProgression(0);
  }, [images.length]);

  useEffect(() => {
    const intervalle = setInterval(() => {
      if (!refPause.current) imageSuivante();
    }, INTERVALLE_HERO_MS);
    return () => clearInterval(intervalle);
  }, [imageSuivante]);

  useEffect(() => {
    setProgression(0);
    if (refPause.current) return;
    const pas = 50;
    const increment = (pas / INTERVALLE_HERO_MS) * 100;
    const timer = setInterval(() => {
      setProgression((p) => (p >= 100 ? 0 : p + increment));
    }, pas);
    return () => clearInterval(timer);
  }, [indexActif]);

  const pauseTemporaire = () => {
    refPause.current = true;
    window.setTimeout(() => {
      refPause.current = false;
    }, DELAI_REPRISE_MS);
  };

  const imageCourante = images[indexActif];

  return (
    <section
      className="section-hero-a-propos relative min-h-[380px] overflow-hidden sm:min-h-[440px] lg:min-h-[520px]"
      aria-labelledby="titre-a-propos"
      aria-roledescription="carousel"
      aria-label="Présentation HAM Laboratoire"
      onMouseEnter={() => {
        refPause.current = true;
      }}
      onMouseLeave={() => {
        refPause.current = false;
      }}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <AnimatePresence mode="sync">
          <motion.div
            key={indexActif}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ImageVitrine
              src={imageCourante.url}
              alt={imageCourante.alt || hero.nom}
              fill
              className="object-cover object-center"
              priority={indexActif === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#2d2a6e]/88 to-[#1a4d7c]/75" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="conteneur-principal relative z-10 flex min-h-[380px] items-center py-10 sm:min-h-[440px] sm:py-12 lg:min-h-[520px] lg:py-16">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-4">
              <Image
                src={CHEMIN_LOGO_HAM}
                alt="Logo HAM Laboratoire"
                width={80}
                height={80}
                className="h-16 w-16 rounded-full border-2 border-white/30 object-cover shadow-xl sm:h-20 sm:w-20"
                priority
              />
              <div className="hidden h-10 w-px bg-white/20 sm:block" aria-hidden="true" />
              <p className="hidden text-xs font-bold uppercase tracking-[0.15em] text-[#7dd3fc] sm:block">
                Depuis Kinshasa · RDC
              </p>
            </div>

            <p className="text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-white/70 sm:text-xs">
              {hero.typeEtablissement}
            </p>

            <h1
              id="titre-a-propos"
              className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
            >
              {hero.nom}
            </h1>

            <div className="mt-5 space-y-2">
              <span className="inline-block rounded-lg bg-[#7a1f4e] px-4 py-2 text-[10px] font-bold italic uppercase tracking-wide text-white shadow-lg sm:text-xs">
                {hero.badgeSlogan}
              </span>
              <p className="text-xs font-bold italic uppercase leading-snug tracking-wide text-white/90 sm:text-sm">
                {hero.suiteSlogan.split("PRÉÉMINENCE")[0]}
                <span className="text-[#7dd3fc] underline decoration-[#7a1f4e] decoration-2 underline-offset-4">
                  PRÉÉMINENCE
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7dd3fc]">
                {imageCourante.alt}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {"descriptionCarte" in hero && hero.descriptionCarte
                  ? String(hero.descriptionCarte)
                  : "Centre de diagnostic et d'analyses médicales équipé pour répondre aux exigences les plus strictes en matière de fiabilité et d'accessibilité."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation carrousel */}
      <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 gap-2 sm:flex sm:right-6">
        <button
          type="button"
          onClick={() => {
            pauseTemporaire();
            allerA(indexActif - 1);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-black/50"
          aria-label="Image précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            pauseTemporaire();
            allerA(indexActif + 1);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-black/50"
          aria-label="Image suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="conteneur-principal flex items-center justify-between pb-3">
          <div className="flex gap-1.5" role="tablist" aria-label="Images du carrousel">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === indexActif ? "true" : "false"}
                aria-label={`Image ${index + 1} sur ${images.length}`}
                onClick={() => {
                  allerA(index);
                  pauseTemporaire();
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === indexActif
                    ? "w-6 bg-[#7dd3fc]"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium tabular-nums text-white/50">
            {String(indexActif + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        </div>
        <div className="h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7dd3fc] to-[#7a1f4e]"
            style={{ width: `${progression}%` }}
          />
        </div>
      </div>
    </section>
  );
}
