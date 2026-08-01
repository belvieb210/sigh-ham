"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SERVICES_MEDICAUX } from "@/constants/navigation";
import { CARTE_ICONES_SERVICES } from "@/components/icones/icones-medicales";
import { EnTeteSection } from "@/components/ui/en-tete-section";

export function SectionServices() {
  const { t } = useTranslation();

  return (
    <section
      className="section-services relative overflow-hidden bg-white py-12 lg:py-20"
      aria-labelledby="titre-services"
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 h-64 w-64 rounded-full bg-bleu-medical/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bleu-medical">
            {t("accueil.prestationsMedicales")}
          </p>
        </div>
        <EnTeteSection
          idTitre="titre-services"
          titre={t("accueil.nosServices")}
          sousTitre={t("accueil.sousTitreServices")}
          lienVoirTout={{
            href: "/services",
            etiquette: t("common.voirTous"),
          }}
          classNameTitre="text-[#2d2a6e]"
        />

        {/* Mobile : grille compacte 3×2 */}
        <div className="mt-6 grid grid-cols-3 gap-3 lg:hidden">
          {SERVICES_MEDICAUX.map((service, index) => {
            const Icone = CARTE_ICONES_SERVICES[service.icone];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={service.href}
                  className="carte-service-mobile group flex flex-col items-center rounded-xl border border-gris-bordure/70 bg-white px-2 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-bleu-medical/30 hover:shadow-md"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-bleu-medical-clair text-bleu-medical transition-colors group-hover:bg-bleu-medical group-hover:text-white">
                    <Icone className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold leading-tight text-texte-principal">
                    {t(`accueil.services.${service.id}.titre`)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop : cartes premium 3×2 */}
        <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
          {SERVICES_MEDICAUX.map((service, index) => {
            const Icone = CARTE_ICONES_SERVICES[service.icone];
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="carte-service group relative flex flex-col overflow-hidden rounded-2xl border border-gris-bordure/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bleu-medical/25 hover:shadow-[0_16px_40px_-12px_rgba(26,77,124,0.18)]"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-bleu-medical/5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />

                <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bleu-medical-clair to-white text-bleu-medical shadow-sm ring-1 ring-bleu-medical/10 transition-all duration-300 group-hover:from-bleu-medical group-hover:to-[#2d2a6e] group-hover:text-white group-hover:ring-bleu-medical/30">
                  <Icone className="h-5 w-5" />
                </div>

                <h3 className="relative mb-2 text-[17px] font-bold text-[#2d2a6e]">
                  {t(`accueil.services.${service.id}.titre`)}
                </h3>
                <p className="relative mb-5 flex-1 text-sm leading-relaxed text-texte-secondaire">
                  {t(`accueil.services.${service.id}.description`)}
                </p>
                <Link
                  href={service.href}
                  className="relative mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-bleu-medical transition-colors hover:text-bleu-medical-fonce"
                >
                  {t("common.enSavoirPlus")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
