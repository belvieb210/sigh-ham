"use client";

import { motion } from "framer-motion";
import { useContenuCampagnes } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";

export function SectionParcoursCampagnes() {
  const { parcours } = useContenuCampagnes();

  return (
    <section
      className="section-parcours-campagnes relative overflow-hidden bg-gradient-to-br from-[#eef0f8] via-white to-[#fdf2f8] py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-parcours-campagnes"
    >
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#7a1f4e]/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <EnTeteSection
          idTitre="titre-parcours-campagnes"
          titre={parcours.titre}
          sousTitre={parcours.sousTitre}
        />

        <div className="relative mt-10 lg:mt-14">
          <div
            className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-[#7a1f4e]/20 via-bleu-medical/40 to-[#7a1f4e]/20 lg:block"
            aria-hidden="true"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {parcours.etapes.map((etape, index) => (
              <motion.div
                key={etape.numero}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl border border-gris-bordure/80 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm lg:text-left"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a1f4e] to-[#2d2a6e] text-xl font-extrabold text-white shadow-lg lg:mx-0">
                  {etape.numero}
                </div>
                <h3 className="text-base font-bold text-texte-principal">
                  {etape.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-texte-secondaire">
                  {etape.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
