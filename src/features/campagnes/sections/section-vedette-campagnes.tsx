"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { CARTE_ICONES_CAMPAGNES } from "@/components/icones/icones-medicales";
import { Bouton } from "@/components/ui/bouton";
import { CarrouselImagesVitrine } from "@/components/ui/carrousel-images-vitrine";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { useCampagnesVedette } from "@/hooks/use-campagnes";
import { useCampagnesTraduits } from "@/hooks/use-contenu-page";
import {
  LIBELLES_CATEGORIE,
  LIBELLES_STATUT,
} from "@/lib/campagnes-utils";
import {
  classeAccentCampagne,
  styleFondCampagne,
} from "@/lib/client/couleurs-campagne";
import { cn } from "@/lib/utils";

const INTERVALLE_MS = 6000;
const DELAI_REPRISE_MS = 7000;

const STYLES_STATUT = {
  en_cours: "bg-vert-sante text-white",
  a_venir: "bg-bleu-medical text-white",
  terminee: "bg-white/20 text-white backdrop-blur-sm",
} as const;

export function SectionVedetteCampagnes() {
  const { data: vedettes, isLoading } = useCampagnesVedette();
  const campagnesTraduits = useCampagnesTraduits();
  const [indexActif, setIndexActif] = useState(0);
  const [progression, setProgression] = useState(0);
  const refPause = useRef(false);

  const traductionsParId = useMemo(
    () => Object.fromEntries(campagnesTraduits.map((c) => [c.id, c])),
    [campagnesTraduits]
  );

  const campagnes = useMemo(
    () =>
      (vedettes ?? []).map((c) => {
        const trad = traductionsParId[c.id];
        return {
          ...c,
          titre: trad?.titre ?? c.titre,
          description: trad?.extrait ?? c.description,
        };
      }),
    [vedettes, traductionsParId]
  );
  const campagne = campagnes[indexActif];

  const suivant = useCallback(() => {
    if (campagnes.length === 0) return;
    setIndexActif((i) => (i + 1) % campagnes.length);
    setProgression(0);
  }, [campagnes.length]);

  const precedent = useCallback(() => {
    if (campagnes.length === 0) return;
    setIndexActif((i) => (i - 1 + campagnes.length) % campagnes.length);
    setProgression(0);
  }, [campagnes.length]);

  useEffect(() => {
    if (campagnes.length <= 1) return;
    const intervalle = setInterval(() => {
      if (!refPause.current) suivant();
    }, INTERVALLE_MS);
    return () => clearInterval(intervalle);
  }, [campagnes.length, suivant]);

  useEffect(() => {
    if (campagnes.length <= 1 || refPause.current) return;
    setProgression(0);
    const pas = 50;
    const increment = (pas / INTERVALLE_MS) * 100;
    const timer = setInterval(() => {
      setProgression((p) => (p >= 100 ? 0 : p + increment));
    }, pas);
    return () => clearInterval(timer);
  }, [indexActif, campagnes.length]);

  const pauseTemporaire = () => {
    refPause.current = true;
    window.setTimeout(() => {
      refPause.current = false;
    }, DELAI_REPRISE_MS);
  };

  if (isLoading || campagnes.length === 0) return null;

  const Icone = CARTE_ICONES_CAMPAGNES[campagne.icone];
  const fond = styleFondCampagne(campagne.couleurIllustration);
  const galerie =
    campagne.images && campagne.images.length > 0
      ? campagne.images
      : campagne.imageUrl
        ? [{ url: campagne.imageUrl }]
        : [];

  return (
    <section
      id="campagnes-vedette"
      className="section-vedette-campagnes bg-[#0f172a] py-12 sm:py-16 lg:py-20"
      aria-label="Campagnes à la une"
      aria-roledescription="carousel"
    >
      <div className="conteneur-principal">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f9a8d4]">
              À la une
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              Campagnes phares
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/60">
              Nos actions prioritaires — dépistages, événements et initiatives de santé publique.
            </p>
          </div>

          {campagnes.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  pauseTemporaire();
                  precedent();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Campagne précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  pauseTemporaire();
                  suivant();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Campagne suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          onMouseEnter={() => {
            refPause.current = true;
          }}
          onMouseLeave={() => {
            refPause.current = false;
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={campagne.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="grid lg:grid-cols-2"
            >
              {/* Visuel */}
              <div className="relative min-h-[260px] lg:min-h-[420px]">
                {galerie.length > 1 ? (
                  <>
                    <CarrouselImagesVitrine
                      images={galerie}
                      className="absolute inset-0"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      showNav={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0f172a]/30 lg:to-[#0f172a]/90" />
                  </>
                ) : galerie[0]?.url ? (
                  <>
                    <ImageVitrine
                      src={galerie[0].url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-[#0f172a]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0f172a]/30 lg:to-[#0f172a]/90" />
                  </>
                ) : (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      fond.className
                    )}
                    style={fond.style}
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center lg:hidden">
                  <div
                    className={cn(
                      "opacity-30",
                      classeAccentCampagne(campagne.couleurAccent)
                    )}
                  >
                    <Icone />
                  </div>
                </div>

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                      STYLES_STATUT[campagne.statut]
                    )}
                  >
                    {LIBELLES_STATUT[campagne.statut]}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {LIBELLES_CATEGORIE[campagne.categorie]}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="flex flex-col justify-center bg-[#0f172a] p-7 sm:p-10 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#f9a8d4]">
                  {LIBELLES_CATEGORIE[campagne.categorie]}
                </p>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                  {campagne.titre}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                  {campagne.description}
                </p>

                <div className="mt-6 space-y-2.5 text-sm text-white/60">
                  <p className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0 text-[#f9a8d4]" />
                    {campagne.periode}
                  </p>
                  {campagne.lieu && (
                    <p className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-[#f9a8d4]" />
                      {campagne.lieu}
                    </p>
                  )}
                </div>

                <Link href={campagne.href} className="mt-8">
                  <Bouton
                    taille="grand"
                    className="bg-[#7a1f4e] hover:bg-[#6a1a44]"
                    enTantQueEnfant
                  >
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </Bouton>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {campagnes.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-[#f9a8d4]"
                style={{ width: `${progression}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          )}
        </div>

        {/* Miniatures */}
        {campagnes.length > 1 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {campagnes.map((c, index) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  pauseTemporaire();
                  setIndexActif(index);
                  setProgression(0);
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  index === indexActif
                    ? "border-[#f9a8d4]/50 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#f9a8d4]">
                  {LIBELLES_STATUT[c.statut]}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                  {c.titre}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
