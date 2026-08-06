"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DIAPOSITIVES_HERO_ACCUEIL,
  INTERVALLE_CARROUSEL_HERO_MS,
} from "@/constants/hero-accueil";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import type { DiapositiveHeroAccueil } from "@/types/hero-accueil";

const DELAI_REPRISE_MS = 6000;

interface PropsCarrouselFondHero {
  diapositives?: DiapositiveHeroAccueil[];
  onIndexChange?: (index: number, slide: DiapositiveHeroAccueil) => void;
}

export function CarrouselFondHero({
  diapositives = DIAPOSITIVES_HERO_ACCUEIL.filter((d) => d.publie).sort(
    (a, b) => a.ordre - b.ordre
  ),
  onIndexChange,
}: PropsCarrouselFondHero) {
  const [indexActif, setIndexActif] = useState(0);
  const refPause = useRef(false);

  const diapositiveSuivante = useCallback(() => {
    setIndexActif((i) => (i + 1) % Math.max(diapositives.length, 1));
  }, [diapositives.length]);

  useEffect(() => {
    if (diapositives.length <= 1) return;

    const intervalle = setInterval(() => {
      if (!refPause.current) diapositiveSuivante();
    }, INTERVALLE_CARROUSEL_HERO_MS);

    return () => clearInterval(intervalle);
  }, [diapositiveSuivante, diapositives.length]);

  const imageCourante = diapositives[indexActif] ?? diapositives[0];

  useEffect(() => {
    if (imageCourante) onIndexChange?.(indexActif, imageCourante);
  }, [indexActif, imageCourante, onIndexChange]);

  if (!imageCourante) return null;

  return (
    <div
      className="carrousel-fond-hero absolute inset-0 bg-gradient-to-br from-bleu-medical-clair via-slate-50 to-bleu-medical/10"
      aria-hidden="true"
      onMouseEnter={() => {
        refPause.current = true;
      }}
      onMouseLeave={() => {
        refPause.current = false;
      }}
    >
      {diapositives.length > 1 ? (
        <AnimatePresence mode="sync">
          <motion.div
            key={imageCourante.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ImageVitrine
              src={imageCourante.url}
              alt={imageCourante.alt || imageCourante.titre || ""}
              fill
              className="object-cover object-center lg:object-right"
              sizes="100vw"
              priority={indexActif === 0}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <ImageVitrine
          src={imageCourante.url}
          alt={imageCourante.alt || ""}
          fill
          className="object-cover object-center lg:object-right"
          priority
          sizes="100vw"
        />
      )}

      {diapositives.length > 1 && (
        <div className="absolute bottom-[7.5rem] right-6 z-[5] hidden gap-1.5 sm:flex lg:bottom-[8.5rem] lg:right-8">
          {diapositives.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                setIndexActif(index);
                refPause.current = true;
                window.setTimeout(() => {
                  refPause.current = false;
                }, DELAI_REPRISE_MS);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === indexActif
                  ? "w-6 bg-bleu-medical"
                  : "w-1.5 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Afficher l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
