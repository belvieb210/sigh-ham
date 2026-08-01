"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { versFormatAccueil } from "@/lib/campagnes-utils";
import { useCampagnesTraduits } from "@/hooks/use-contenu-page";
import { CARTE_ICONES_CAMPAGNES } from "@/components/icones/icones-medicales";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const INTERVALLE_DEFILEMENT_MS = 4500;
const DELAI_REPRISE_MS = 5000;

export function SectionCampagnes() {
  const { t } = useTranslation();
  const campagnesTraduits = useCampagnesTraduits();
  const campagnes = useMemo(
    () => versFormatAccueil(campagnesTraduits),
    [campagnesTraduits]
  );
  const [indexActif, setIndexActif] = useState(0);
  const [defilementPause, setDefilementPause] = useState(false);
  const refCarrousel = useRef<HTMLDivElement>(null);
  const refPause = useRef(false);

  const faireDefilerVers = useCallback((index: number, fluide = true) => {
    const conteneur = refCarrousel.current;
    if (!conteneur) return;

    const carte = conteneur.children[index] as HTMLElement | undefined;
    if (!carte) return;

    conteneur.scrollTo({
      left: carte.offsetLeft - conteneur.offsetLeft,
      behavior: fluide ? "smooth" : "auto",
    });
    setIndexActif(index);
  }, []);

  useEffect(() => {
    const intervalle = setInterval(() => {
      if (refPause.current) return;

      setIndexActif((indexCourant) => {
        const indexSuivant = (indexCourant + 1) % campagnes.length;
        const conteneur = refCarrousel.current;
        const carte = conteneur?.children[indexSuivant] as HTMLElement | undefined;
        if (carte && conteneur) {
          conteneur.scrollTo({
            left: carte.offsetLeft - conteneur.offsetLeft,
            behavior: "smooth",
          });
        }
        return indexSuivant;
      });
    }, INTERVALLE_DEFILEMENT_MS);

    return () => clearInterval(intervalle);
  }, [campagnes.length]);

  const mettreEnPause = useCallback(() => {
    refPause.current = true;
    setDefilementPause(true);
  }, []);

  const reprendreDefilement = useCallback(() => {
    refPause.current = false;
    setDefilementPause(false);
  }, []);

  const mettreEnPauseTemporaire = useCallback(() => {
    mettreEnPause();
    window.setTimeout(reprendreDefilement, DELAI_REPRISE_MS);
  }, [mettreEnPause, reprendreDefilement]);

  const gererScrollManuel = useCallback(() => {
    const conteneur = refCarrousel.current;
    if (!conteneur) return;

    const index = Math.round(
      conteneur.scrollLeft / (conteneur.offsetWidth * 0.88)
    );
    setIndexActif(Math.min(Math.max(index, 0), campagnes.length - 1));
  }, [campagnes.length]);

  return (
    <section
      className="section-campagnes relative overflow-hidden bg-gradient-to-b from-gris-tres-clair to-white py-12 lg:py-20"
      aria-labelledby="titre-campagnes"
    >
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-[#7a1f4e]/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a1f4e]">
            {t("accueil.santePublique")}
          </p>
        </div>
        <EnTeteSection
          idTitre="titre-campagnes"
          titre={t("accueil.campagnesEnCours")}
          sousTitre={t("accueil.sousTitreCampagnes")}
          lienVoirTout={{
            href: "/campagnes",
            etiquette: t("common.voirToutes"),
          }}
          classNameTitre="text-[#2d2a6e]"
        />

        {/* Mobile : carousel */}
        <div
          ref={refCarrousel}
          className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-masquee lg:hidden"
          onScroll={gererScrollManuel}
          onMouseEnter={mettreEnPause}
          onMouseLeave={reprendreDefilement}
          onTouchStart={mettreEnPauseTemporaire}
          aria-roledescription="carousel"
          aria-label="Campagnes de santé"
        >
          {campagnes.map((campagne, index) => {
            const Icone = CARTE_ICONES_CAMPAGNES[campagne.icone];
            return (
              <article
                key={campagne.id}
                id={`campagne-slide-${index}`}
                aria-roledescription="slide"
                aria-label={`${index + 1} sur ${campagnes.length}`}
                className="carte-campagne-mobile min-w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl border border-gris-bordure/60 bg-white shadow-md"
              >
                <div className="flex min-h-[148px]">
                  <div className="flex flex-1 flex-col justify-center p-4">
                    <h3 className="mb-1 text-[14px] font-bold leading-snug text-[#2d2a6e]">
                      {campagne.titre}
                    </h3>
                    <p className="mb-3 text-[11px] text-texte-secondaire">
                      {campagne.periode}
                    </p>
                    <Link
                      href={campagne.href}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-bleu-medical"
                    >
                      {t("common.plusInfos")}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div
                    className={`flex w-[38%] items-center justify-center bg-gradient-to-br ${campagne.couleurIllustration}`}
                  >
                    <div className={campagne.couleurAccent}>
                      <Icone />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center gap-1.5 lg:hidden">
          {campagnes.map((campagne, index) => (
            <button
              key={campagne.id}
              type="button"
              onClick={() => {
                mettreEnPauseTemporaire();
                faireDefilerVers(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === indexActif
                  ? "w-5 bg-bleu-medical"
                  : "w-1.5 bg-gris-bordure hover:bg-bleu-medical/40"
              }`}
              aria-label={`Aller à la campagne : ${campagne.titre}`}
              aria-current={index === indexActif ? "true" : undefined}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {defilementPause
            ? "Défilement automatique en pause"
            : `Campagne ${indexActif + 1} sur ${campagnes.length}`}
        </p>

        {/* Desktop : grille 4 colonnes premium */}
        <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
          {campagnes.map((campagne, index) => {
            const Icone = CARTE_ICONES_CAMPAGNES[campagne.icone];
            return (
              <motion.article
                key={campagne.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="carte-campagne group flex flex-col overflow-hidden rounded-2xl border border-gris-bordure/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bleu-medical/20 hover:shadow-[0_16px_40px_-12px_rgba(26,77,124,0.15)]"
              >
                <div
                  className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${campagne.couleurIllustration}`}
                >
                  <div
                    className={`transition-transform duration-300 group-hover:scale-110 ${campagne.couleurAccent}`}
                  >
                    <Icone />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-[#2d2a6e]">
                    {campagne.titre}
                  </h3>
                  <p className="mb-4 text-xs text-texte-secondaire">
                    {campagne.periode}
                  </p>
                  <Link
                    href={campagne.href}
                    className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gris-bordure bg-white px-4 py-2.5 text-[13px] font-semibold text-bleu-medical transition-all hover:border-bleu-medical/30 hover:bg-bleu-medical-clair/50"
                  >
                    {t("common.plusInfos")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
