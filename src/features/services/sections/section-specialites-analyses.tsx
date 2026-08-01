"use client";

import { motion } from "framer-motion";
import {
  Droplets,
  FlaskConical,
  Bug,
  HeartPulse,
  Shield,
  Activity,
} from "lucide-react";
import { useContenuServices } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const ICONES_DOMAINES = {
  hematologie: Droplets,
  biochimie: FlaskConical,
  microbiologie: Bug,
  parasitologie: Activity,
  immunologie: Shield,
  hormonologie: HeartPulse,
} as const;

export function SectionSpecialitesAnalyses() {
  const { specialites } = useContenuServices();

  return (
    <section
      className="section-specialites relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-specialites"
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-bleu-medical/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            Plateau technique
          </p>
          <h2
            id="titre-specialites"
            className="mt-3 text-2xl font-extrabold text-white sm:text-3xl"
          >
            {specialites.titre}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
            {specialites.sousTitre}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {specialites.domaines.map((domaine, index) => {
            const Icone =
              ICONES_DOMAINES[domaine.id as keyof typeof ICONES_DOMAINES] ??
              FlaskConical;

            return (
              <motion.article
                key={domaine.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-[#7dd3fc]/30 hover:bg-white/8 sm:p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc] transition-colors group-hover:bg-[#7dd3fc]/25">
                    <Icone className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white">{domaine.titre}</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/65">
                  {domaine.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {domaine.examens.map((examen) => (
                    <span
                      key={examen}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#7dd3fc]"
                    >
                      {examen}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
