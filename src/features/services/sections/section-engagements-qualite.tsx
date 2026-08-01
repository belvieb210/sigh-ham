"use client";

import { motion } from "framer-motion";
import { Award, Clock, Heart, Users } from "lucide-react";
import { useContenuServices } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const ICONES_ENGAGEMENTS = {
  fiabilite: Award,
  rapidite: Clock,
  accessibilite: Heart,
  equipe: Users,
} as const;

export function SectionEngagementsQualite() {
  const { engagements } = useContenuServices();

  return (
    <section
      className="section-engagements bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-engagements"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-engagements"
          titre={engagements.titre}
          sousTitre={engagements.sousTitre}
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:gap-6">
          {engagements.items.map((item, index) => {
            const Icone =
              ICONES_ENGAGEMENTS[item.id as keyof typeof ICONES_ENGAGEMENTS] ??
              Award;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group flex gap-4 rounded-2xl border border-gris-bordure bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-bleu-medical/20 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a1f4e]/10 to-bleu-medical/10 text-[#7a1f4e] transition-colors group-hover:from-[#7a1f4e]/15 group-hover:to-bleu-medical/15">
                  <Icone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-texte-principal">{item.titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-texte-secondaire">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
