"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Smartphone, ArrowRight } from "lucide-react";

export function SectionApplicationMobile() {
  const { t } = useTranslation();

  return (
    <section
      className="section-application py-12 lg:py-20"
      aria-labelledby="titre-application"
    >
      <div className="conteneur-principal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a4d7c] via-[#2d2a6e] to-[#0f172a] px-6 py-12 sm:px-10 lg:px-16 lg:py-14"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA2KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-3">
            {/* Mockup téléphone */}
            <div className="hidden justify-center lg:flex">
              <div className="relative h-64 w-36 rounded-3xl border-4 border-white/20 bg-white/10 p-2 shadow-2xl">
                <div className="h-full w-full overflow-hidden rounded-2xl bg-white">
                  <div className="flex h-8 items-center justify-center bg-bleu-medical">
                    <Smartphone className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-full rounded bg-bleu-medical-clair" />
                    <div className="h-3 w-3/4 rounded bg-gris-tres-clair" />
                    <div className="h-3 w-1/2 rounded bg-gris-tres-clair" />
                    <div className="mt-4 h-16 rounded-lg bg-bleu-medical-clair" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:col-span-1 lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
                {t("accueil.appMobile")}
              </p>
              <h2
                id="titre-application"
                className="mt-2 text-2xl font-extrabold text-white sm:text-3xl"
              >
                {t("accueil.appTitre")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                {t("accueil.appDescription")}
              </p>
              <Link
                href="/application"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7dd3fc] hover:text-white"
              >
                {t("accueil.appEnSavoirPlus")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-end">
              <Link
                href="/application#android"
                className="inline-flex w-full items-center gap-3 rounded-xl bg-black/80 px-5 py-3 text-white backdrop-blur-sm transition-all hover:bg-black sm:w-auto"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M3.6 1.8l13.2 7.5L3.6 16.8V1.8zm14.4 8.3l-2.1 1.2-2.5-1.4 2.5-1.4 2.1 1.2v.4zm0-1.8v-4.5L6.9 12l11.1 6.3V13.5l-2.1 1.2-2.5-1.4 2.5-1.4 2.1 1.2z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase text-white/60">
                    {t("accueil.disponibleSur")}
                  </p>
                  <p className="text-sm font-semibold">{t("accueil.googlePlay")}</p>
                </div>
              </Link>
              <Link
                href="/application#ios"
                className="inline-flex w-full items-center gap-3 rounded-xl bg-black/80 px-5 py-3 text-white backdrop-blur-sm transition-all hover:bg-black sm:w-auto"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.7 12.5c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.79-.41 6.92 1.16 9.19.77 1.11 1.69 2.36 2.9 2.31 1.17-.05 1.61-.75 3.02-.75 1.41 0 1.81.75 3.04.73 1.26-.02 2.05-1.14 2.81-2.25.89-1.3 1.25-2.56 1.27-2.62-.03-.01-2.44-.94-2.47-3.72zM15.5 4.2c.64-.78 1.07-1.87.95-2.95-.92.04-2.03.61-2.69 1.39-.59.68-1.11 1.77-.97 2.82 1.03.08 2.08-.53 2.71-1.26z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] uppercase text-white/60">
                    {t("accueil.telechargerSur")}
                  </p>
                  <p className="text-sm font-semibold">{t("accueil.appStore")}</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
