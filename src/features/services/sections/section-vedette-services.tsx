"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FlaskConical,
} from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { useContenuServices } from "@/hooks/use-contenu-page";
import { IMAGES_LABORATOIRE } from "@/constants/images";
import { cn } from "@/lib/utils";

const INTERVALLE_CARROUSEL_MS = 5000;
const DELAI_REPRISE_MS = 7000;

const VALEURS_CLES = ["200+", "24h", "ISO 9001"] as const;

export function SectionVedetteServices() {
  const { services, vedette } = useContenuServices();
  const chiffresCles = vedette.chiffres.map((item, index) => ({
    icone: [FlaskConical, Clock, Award][index],
    valeur: VALEURS_CLES[index],
    libelle: item.libelle,
  }));

  const servicePhare = useMemo(() => {
    const avecPhare = services.find(
      (s) => "estPhare" in s && Boolean((s as { estPhare?: boolean }).estPhare)
    );
    if (avecPhare) return avecPhare;
    return services.find(
      (s) => "badge" in s && Boolean((s as { badge?: string }).badge)
    );
  }, [services]);

  const [indexActif, setIndexActif] = useState(0);
  const [progression, setProgression] = useState(0);
  const refPause = useRef(false);

  const images = useMemo(() => {
    const fromDb =
      servicePhare &&
      "images" in servicePhare &&
      Array.isArray(
        (servicePhare as { images?: { url: string; legende?: string }[] }).images
      )
        ? (servicePhare as { images: { url: string; legende?: string }[] }).images
        : [];
    if (fromDb.length > 0) {
      return fromDb.map((img) => ({
        url: img.url,
        alt: img.legende || servicePhare?.titre || "Service phare",
      }));
    }
    if (servicePhare && "imageUrl" in servicePhare && servicePhare.imageUrl) {
      return [{ url: servicePhare.imageUrl as string, alt: servicePhare.titre }];
    }
    return IMAGES_LABORATOIRE.map((img) => ({ url: img.url, alt: img.alt }));
  }, [servicePhare]);

  const allerA = useCallback(
    (index: number) => {
      setIndexActif((index + images.length) % images.length);
      setProgression(0);
    },
    [images.length]
  );

  const suivant = useCallback(() => {
    setIndexActif((i) => (i + 1) % images.length);
    setProgression(0);
  }, [images.length]);

  const precedent = useCallback(() => {
    setIndexActif((i) => (i - 1 + images.length) % images.length);
    setProgression(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return;
    const intervalle = setInterval(() => {
      if (!refPause.current) setIndexActif((i) => (i + 1) % images.length);
    }, INTERVALLE_CARROUSEL_MS);
    return () => clearInterval(intervalle);
  }, [images.length]);

  useEffect(() => {
    setProgression(0);
    if (refPause.current || images.length < 2) return;
    const pas = 50;
    const increment = (pas / INTERVALLE_CARROUSEL_MS) * 100;
    const timer = setInterval(() => {
      setProgression((p) => (p >= 100 ? 0 : p + increment));
    }, pas);
    return () => clearInterval(timer);
  }, [indexActif, images.length]);

  const pauseTemporaire = () => {
    refPause.current = true;
    window.setTimeout(() => {
      refPause.current = false;
    }, DELAI_REPRISE_MS);
  };

  if (!servicePhare || images.length === 0) return null;

  const imageCourante = images[indexActif] ?? images[0];
  const badge =
    "badge" in servicePhare && servicePhare.badge
      ? String(servicePhare.badge)
      : vedette.badge;

  return (
    <section
      id="service-phare"
      className="section-vedette-services relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
      aria-label="Service phare"
    >
      <div
        className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-bleu-medical/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
              Notre expertise
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              Service phare
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/60">
              {servicePhare.description}
            </p>
            <Link
              href="/services/laboratoire"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              {vedette.decouvrir}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vert-sante opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-vert-sante" />
            </span>
            <span className="text-xs font-semibold text-white/80">
              Plateau technique opérationnel
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl ring-1 ring-white/5"
        >
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div
              role="group"
              className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]"
              aria-roledescription="carousel"
              aria-label="Galerie service phare"
              onMouseEnter={() => {
                refPause.current = true;
              }}
              onMouseLeave={() => {
                refPause.current = false;
              }}
            >
              <AnimatePresence mode="sync">
                <motion.div
                  key={imageCourante.url}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <ImageVitrine
                    src={imageCourante.url}
                    alt={imageCourante.alt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority={indexActif === 0}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/10 to-transparent" />

              <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
                <span className="rounded-full bg-[#7a1f4e] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                  {badge}
                </span>
              </div>

              {images.length > 1 ? (
                <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-5 sm:top-5">
                  <button
                    type="button"
                    onClick={() => {
                      pauseTemporaire();
                      precedent();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      pauseTemporaire();
                      suivant();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              <div className="absolute bottom-[52px] left-4 right-4 z-10 flex flex-col gap-3 sm:left-5 sm:right-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-sm rounded-2xl border border-white/15 bg-black/40 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7dd3fc]">
                    Visite
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-white">
                    {imageCourante.alt}
                  </p>
                </div>

                {images.length > 1 ? (
                  <div className="hidden shrink-0 gap-2 lg:flex">
                    {images.map((img, index) => (
                      <button
                        key={`${img.url}-${index}`}
                        type="button"
                        aria-label={`Afficher : ${img.alt}`}
                        aria-current={index === indexActif ? "true" : undefined}
                        onClick={() => {
                          pauseTemporaire();
                          allerA(index);
                        }}
                        className={cn(
                          "relative h-14 w-20 overflow-hidden rounded-lg border-2 transition-all",
                          index === indexActif
                            ? "border-[#7dd3fc] shadow-lg shadow-[#7dd3fc]/20"
                            : "border-white/20 opacity-70 hover:opacity-100"
                        )}
                      >
                        <ImageVitrine
                          src={img.url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex gap-1.5 sm:hidden">
                    {images.map((img, index) => (
                      <button
                        key={`${img.url}-dot-${index}`}
                        type="button"
                        aria-label={`Photo ${index + 1}`}
                        onClick={() => {
                          pauseTemporaire();
                          allerA(index);
                        }}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          index === indexActif
                            ? "w-6 bg-[#7dd3fc]"
                            : "w-1.5 bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                  <span className="ml-auto text-[11px] font-medium tabular-nums text-white/50">
                    {String(indexActif + 1).padStart(2, "0")} /{" "}
                    {String(images.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="h-0.5 bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#7dd3fc] to-bleu-medical"
                    style={{ width: `${progression}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center border-t border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1a2744] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7dd3fc]">
                Diagnostic · Laboratoire
              </p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {servicePhare.titre}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                {servicePhare.description}
              </p>

              <ul className="mt-6 space-y-3">
                {servicePhare.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/80"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-vert-sante" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                {chiffresCles.map(({ icone: Icone, valeur, libelle }) => (
                  <div
                    key={libelle}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm"
                  >
                    <Icone className="mx-auto h-4 w-4 text-[#7dd3fc]" />
                    <p className="mt-1.5 text-sm font-extrabold text-white sm:text-base">
                      {valeur}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-white/50 sm:text-[11px]">
                      {libelle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
