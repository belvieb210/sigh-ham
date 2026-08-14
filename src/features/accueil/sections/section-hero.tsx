"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Stethoscope,
  Building2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { CarrouselFondHero } from "@/features/accueil/components/carrousel-fond-hero";
import { STATISTIQUES_ACCUEIL } from "@/constants/navigation";
import { useStatistiquesVitrine } from "@/hooks/use-statistiques-vitrine";
import { statistiquesHeroAccueil } from "@/lib/client/statistiques-vitrine-utils";

const CARTE_ICONES_STATS = {
  medecins: Stethoscope,
  departements: Building2,
  patients: Users,
  certification: ShieldCheck,
} as const;

/** Icône décorative médicale — accent bleu corporate */
function IconePlusDecoratif() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="icone-plus-hero pointer-events-none absolute right-[8%] top-[18%] z-10 hidden md:block lg:right-[22%] lg:top-[14%]"
      aria-hidden="true"
    >
      <div className="relative flex h-20 w-20 items-center justify-center lg:h-24 lg:w-24">
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-bleu-medical/15"
        />
        <span className="absolute inset-2 rounded-full border border-bleu-medical/25" />
        <span className="absolute inset-4 rounded-full border border-[#7dd3fc]/30" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-degrade-ham text-2xl font-light text-white shadow-lg lg:h-11 lg:w-11">
          +
        </span>
      </div>
    </motion.div>
  );
}

/** Vague décorative coin supérieur droit */
function VagueDecorative() {
  return (
    <svg
      className="pointer-events-none absolute -right-4 top-0 z-10 hidden h-32 w-48 text-bleu-medical/12 lg:block xl:h-40 xl:w-56"
      viewBox="0 0 200 120"
      fill="none"
      aria-hidden="true"
    >
      <path d="M200 0C140 40 80 20 0 60V0H200Z" fill="currentColor" />
      <path
        d="M200 20C150 55 90 45 20 90V20H200Z"
        className="text-[#2d2a6e]/10"
        fill="currentColor"
      />
    </svg>
  );
}

export function SectionHero({
  diapositives,
}: {
  diapositives?: import("@/types/hero-accueil").DiapositiveHeroAccueil[];
}) {
  const { t } = useTranslation();
  const { data: stats } = useStatistiquesVitrine();
  const [slideActif, setSlideActif] = useState(
    diapositives?.[0] ?? undefined
  );

  const CLES_STATS: Record<string, string> = {
    medecins: "accueil.stats.medecins",
    departements: "accueil.stats.departements",
    patients: "accueil.stats.patients",
    certification: "accueil.stats.certification",
  };

  const valeursStats = stats ? statistiquesHeroAccueil(stats) : null;

  const legendeSlide =
    slideActif?.titre?.trim() ||
    slideActif?.alt?.trim() ||
    null;

  return (
    <section
      className="section-hero relative min-h-[580px] overflow-hidden lg:min-h-[640px]"
      aria-labelledby="titre-hero"
    >
      <CarrouselFondHero
        diapositives={diapositives}
        onIndexChange={(_i, slide) => setSlideActif(slide)}
      />

      <div
        className="hero-overlay-degrade absolute inset-0"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNiw3NywxMjQsMC4wNCkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"
        aria-hidden="true"
      />

      <VagueDecorative />
      <IconePlusDecoratif />

      <div className="conteneur-principal relative z-20 flex min-h-[580px] flex-col justify-center pb-36 pt-10 lg:min-h-[640px] lg:pb-44 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-xl space-y-5 lg:max-w-2xl"
        >
          <p className="inline-flex items-center rounded-full border border-[#4D2254]/20 bg-white/80 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-degrade-ham backdrop-blur-sm sm:text-[11px]">
            {t("hopital.typeEtablissement")}
          </p>

          <h1
            id="titre-hero"
            className="text-[1.5rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]"
          >
            <span className="text-degrade-ham">
              {t("hopital.titreAccueil")}
            </span>
            <br />
            <span className="text-degrade-ham">
              {t("hopital.titreAccueilSuite")}
            </span>
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-texte-secondaire sm:text-[15px]">
            {legendeSlide ?? t("hopital.description")}
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href={slideActif?.lienHref || "/services"}
              className="w-full sm:w-auto"
            >
              <Bouton
                variante="primaire"
                taille="grand"
                className="w-full rounded-full border-0 !bg-degrade-ham px-7 !text-white shadow-md hover:opacity-95 hover:shadow-lg sm:w-auto"
                enTantQueEnfant
              >
                {t("accueil.nosServicesBtn")}
                <ArrowRight className="h-4 w-4" />
              </Bouton>
            </Link>
            <Link href="/rendez-vous" className="w-full sm:w-auto">
              <Bouton
                variante="contour"
                taille="grand"
                className="w-full rounded-full border-degrade-ham bg-white/90 px-7 shadow-sm backdrop-blur-sm hover:bg-[#4D2254]/5 sm:w-auto"
                enTantQueEnfant
              >
                <Calendar className="h-4 w-4 text-[#4D2254]" />
                <span className="text-degrade-ham">{t("accueil.prendreRdv")}</span>
              </Bouton>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="conteneur-principal absolute bottom-5 left-0 right-0 z-30 lg:bottom-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="barre-stats-hero rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-[0_12px_40px_-8px_rgba(26,77,124,0.18)] backdrop-blur-lg sm:rounded-full sm:px-6 sm:py-3.5 lg:px-8"
        >
          <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-between sm:gap-2">
            {STATISTIQUES_ACCUEIL.map((stat, index) => {
              const Icone = CARTE_ICONES_STATS[stat.icone];
              const valeurDynamique =
                stat.id === "medecins"
                  ? valeursStats?.medecins
                  : stat.id === "departements"
                    ? valeursStats?.departements &&
                      valeursStats.departements !== "0"
                      ? valeursStats.departements
                      : null
                    : stat.id === "patients"
                      ? valeursStats?.patients
                      : stat.id === "certification"
                        ? valeursStats?.certification
                        : null;
              return (
                <div
                  key={stat.id}
                  className={`flex items-center gap-2.5 sm:gap-3 ${
                    index > 0
                      ? "sm:border-l sm:border-gris-bordure/60 sm:pl-4 lg:pl-6"
                      : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bleu-medical-clair to-white text-bleu-medical shadow-sm sm:h-10 sm:w-10">
                    <Icone
                      className="h-[18px] w-[18px] sm:h-5 sm:w-5"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight text-[#2d2a6e] sm:text-sm">
                      {valeurDynamique ?? stat.valeur}
                    </p>
                    <p className="text-[10px] leading-snug text-texte-secondaire sm:text-[11px]">
                      {t(CLES_STATS[stat.id] ?? stat.libelle)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
