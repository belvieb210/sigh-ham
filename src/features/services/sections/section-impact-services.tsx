"use client";

import { motion } from "framer-motion";
import { useContenuServices } from "@/hooks/use-contenu-page";

export function SectionImpactServices() {
  const { impact } = useContenuServices();

  return (
    <section
      className="section-impact-services bg-white py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-impact-services"
    >
      <div className="conteneur-principal">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bleu-medical">
            Performance & qualité
          </p>
          <h2
            id="titre-impact-services"
            className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
          >
            {impact.titre}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-texte-secondaire sm:text-base">
            {impact.sousTitre}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {impact.indicateurs.map((indicateur, index) => (
            <motion.article
              key={indicateur.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-gris-bordure bg-gradient-to-br from-white to-bleu-medical-clair/30 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-bleu-medical/5 transition-transform group-hover:scale-150"
                aria-hidden="true"
              />
              <p className="relative text-3xl font-extrabold text-bleu-medical sm:text-4xl">
                {indicateur.valeur}
              </p>
              <h3 className="relative mt-2 font-bold text-texte-principal">
                {indicateur.libelle}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-texte-secondaire">
                {indicateur.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
