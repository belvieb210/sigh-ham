"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import type { ImageFondHero } from "@/lib/client/extraire-images-fond-hero";

const INTERVALLE_MS = 5500;

interface PropsCarrouselFondSectionHero {
  images: ImageFondHero[];
  /** Classes Tailwind pour le dégradé par-dessus l'image */
  gradientClassName?: string;
  altFallback?: string;
}

/** Carrousel auto en arrière-plan des sections hero (services, campagnes, contact…). */
export function CarrouselFondSectionHero({
  images,
  gradientClassName = "bg-gradient-to-r from-[#0f172a]/95 via-[#1a4d7c]/90 to-[#2d2a6e]/85",
  altFallback = "",
}: PropsCarrouselFondSectionHero) {
  const valides = images.filter((i) => i.url && !i.url.startsWith("/images/"));
  const [indexActif, setIndexActif] = useState(0);
  const refPause = useRef(false);

  const suivante = useCallback(() => {
    if (valides.length <= 1) return;
    setIndexActif((i) => (i + 1) % valides.length);
  }, [valides.length]);

  useEffect(() => {
    if (valides.length <= 1) return;
    const t = setInterval(() => {
      if (!refPause.current) suivante();
    }, INTERVALLE_MS);
    return () => clearInterval(t);
  }, [suivante, valides.length]);

  const courante = valides[indexActif];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      onMouseEnter={() => {
        refPause.current = true;
      }}
      onMouseLeave={() => {
        refPause.current = false;
      }}
    >
      {courante ? (
        <AnimatePresence mode="sync">
          <motion.div
            key={courante.url + indexActif}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ImageVitrine
              src={courante.url}
              alt={courante.alt || altFallback}
              fill
              className="object-cover"
              priority={indexActif === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      ) : null}
      <div className={`absolute inset-0 ${gradientClassName}`} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
    </div>
  );
}
