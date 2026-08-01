"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Calendar, MapPin } from "lucide-react";
import { useContenuRendezVous } from "@/hooks/use-contenu-page";

const ICONES = {
  file: FileText,
  clock: Clock,
  calendar: Calendar,
  "map-pin": MapPin,
} as const;

export function SectionInfosPratiquesRendezVous() {
  const { infosPratiques } = useContenuRendezVous();

  return (
    <section
      className="section-infos-pratiques relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-infos-pratiques"
    >
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-bleu-medical/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            {infosPratiques.surtitre}
          </p>
          <h2
            id="titre-infos-pratiques"
            className="mt-3 text-2xl font-extrabold text-white sm:text-3xl"
          >
            {infosPratiques.titre}
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            {infosPratiques.sousTitre}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:gap-6">
          {infosPratiques.items.map((item, index) => {
            const Icone = ICONES[item.icone];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-[#7dd3fc]/30 sm:p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc]">
                  <Icone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{item.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
